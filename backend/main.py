import json
import os
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from typing import Optional

from services.trip_service import calculate_total_cost, calculate_daily_budget, get_trip_category, get_transportation_recommendation, get_season
from services.bedrock_service import get_ai_recommendations, get_chat_response
from services.auth_service import register_user, login_user, get_current_user
from services.kb_service import retrieve_and_generate
from services.refinement_service import get_trip_refinement_response

from models.trip import Trip
from models.user import User
from models.conversation import Conversation, Message
from database import SessionLocal, init_db

load_dotenv()

# Request schemas

class TripRequest(BaseModel):
    destinations: list[str]
    country: str
    budget: float
    days: int
    hotel_cost: Optional[float] = None
    transportation_cost: Optional[float] = None
    food_cost: Optional[float] = None
    miscellaneous_cost: Optional[float] = None
    currency: str
    travel_month: str
    travel_style: str

class TripUpdateRequest(BaseModel):
    budget:       Optional[float] = None
    days:         Optional[int]   = None
    travel_style: Optional[str]   = None
    travel_month: Optional[str]   = None

class RegisterRequest(BaseModel):
    name:     str
    email:    str
    password: str

    @field_validator("email")
    @classmethod
    def email_must_contain_at(cls, v: str) -> str:
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("Invalid email address")
        return v.lower().strip()

    @field_validator("password")
    @classmethod
    def password_must_be_strong(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not any(c.isalpha() for c in v):
            raise ValueError("Password must contain at least one letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one number")
        return v

class LoginRequest(BaseModel):
    email:    str
    password: str

    @field_validator("email")
    @classmethod
    def email_must_contain_at(cls, v: str) -> str:
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("Invalid email address")
        return v.lower().strip()

class AskRequest(BaseModel):
    question: str

class MessageRequest(BaseModel):
    content: str

class ConversationUpdateRequest(BaseModel):
    title: str

    @field_validator("title")
    @classmethod
    def title_must_not_be_blank(cls, v: str) -> str:
        title = v.strip()
        if not title:
            raise ValueError("Conversation title is required")
        return title[:100]

class ApplyChangesRequest(BaseModel):
    proposed_changes: dict

# App Setup

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

# Public Endpoints

@app.get("/")
def home():
    return {"message": "Welcome to KelanaAI!"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/v1/auth/register", status_code=201)
def register(request: RegisterRequest):
    db = SessionLocal()
    try:
        user = register_user(
            db       = db,
            name     = request.name,
            email    = request.email,
            password = request.password,
        )
        return {
            "id":         user.id,
            "name":       user.name,
            "email":      user.email,
            "created_at": user.created_at,
        }
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
    finally:
        db.close()

# POST endpoint — login and receive a JWT
@app.post("/api/v1/auth/login")
def login(request: LoginRequest):
    db = SessionLocal()
    try:
        return login_user(db=db, email=request.email, password=request.password)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    finally:
        db.close()

@app.get("/api/v1/auth/me")
def me(current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    try:
        trip_count = db.query(Trip).filter(Trip.user_id == current_user.id).count()
    finally:
        db.close()
    return {
        "id":          current_user.id,
        "name":        current_user.name,
        "email":       current_user.email,
        "created_at":  current_user.created_at,
        "total_trips": trip_count,
    }

@app.post("/api/v1/ask")
def ask(request: AskRequest, current_user: User = Depends(get_current_user)):
    try:
        result = retrieve_and_generate(request.question)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {
        "question": request.question,
        "answer": result["answer"],
        "source": result["source"],
    }

# ── Country data endpoint ─────────────────────────────────────────────────────

@app.get("/api/v1/countries")
async def list_countries():
    """
    Get list of all countries with flags for dropdown.
    """
    from services.country_service import get_all_countries
    
    countries = await get_all_countries()
    return countries

@app.get("/api/v1/countries/{country_name}")
async def get_country(country_name: str):
    """
    Fetch country data including flag from RestCountries API with caching.
    """
    from services.country_service import get_country_data
    
    country_data = await get_country_data(country_name)
    if not country_data:
        raise HTTPException(
            status_code=404, 
            detail=f"Country data not found for: {country_name}"
        )
    return country_data

# ── Protected conversation endpoints ─────────────────────────────────────────

@app.post("/api/v1/conversations", status_code=201)
def create_conversation(current_user: User = Depends(get_current_user)):
    conversation = Conversation(user_id=current_user.id)
    db = SessionLocal()
    try:
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        return {"conversation_id": conversation.id}
    finally:
        db.close()

@app.get("/api/v1/conversations")
def list_conversations(current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    try:
        conversations = db.query(Conversation).filter(
            Conversation.user_id == current_user.id,
        ).order_by(Conversation.updated_at.desc()).all()
        
        # Enhance each conversation with last message preview
        result = []
        for conv in conversations:
            last_message = db.query(Message).filter(
                Message.conversation_id == conv.id
            ).order_by(Message.created_at.desc()).first()
            
            conv_dict = {
                "id": conv.id,
                "title": conv.title,
                "created_at": conv.created_at,
                "updated_at": conv.updated_at,
                "last_message": last_message.content[:80] + "..." if last_message and len(last_message.content) > 80 else last_message.content if last_message else None,
                "last_message_role": last_message.role if last_message else None,
            }
            result.append(conv_dict)
        
        return result
    finally:
        db.close()

@app.patch("/api/v1/conversations/{conversation_id}")
def update_conversation(
    conversation_id: int,
    request: ConversationUpdateRequest,
    current_user: User = Depends(get_current_user),
):
    db = SessionLocal()
    try:
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id,
        ).first()
        if conversation is None:
            raise HTTPException(
                status_code=404,
                detail=f"Conversation {conversation_id} not found",
            )

        conversation.title = request.title
        db.commit()
        db.refresh(conversation)
        return conversation
    finally:
        db.close()

@app.delete("/api/v1/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
):
    db = SessionLocal()
    try:
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id,
        ).first()
        if conversation is None:
            raise HTTPException(
                status_code=404,
                detail=f"Conversation {conversation_id} not found",
            )

        db.delete(conversation)
        db.commit()
        return {"message": f"Conversation {conversation_id} deleted successfully"}
    finally:
        db.close()

@app.post("/api/v1/conversations/{conversation_id}/messages", status_code=201)
def create_conversation_message(
    conversation_id: int,
    request: MessageRequest,
    current_user: User = Depends(get_current_user),
):
    db = SessionLocal()
    try:
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id,
        ).first()
        if conversation is None:
            raise HTTPException(
                status_code=404,
                detail=f"Conversation {conversation_id} not found",
            )

        user_message = Message(
            conversation_id=conversation.id,
            role="user",
            content=request.content,
        )
        db.add(user_message)
        if not conversation.title:
            conversation.title = request.content.strip()[:100]
        db.flush()

        messages = db.query(Message).filter(
            Message.conversation_id == conversation.id,
        ).order_by(Message.created_at, Message.id).all()
        prompt = [
            {
                "role": message.role,
                "content": message.content,
            }
            for message in messages
        ]

        answer = get_chat_response(prompt)
        assistant_message = Message(
            conversation_id=conversation.id,
            role="assistant",
            content=answer,
        )
        db.add(assistant_message)
        db.commit()
        db.refresh(user_message)
        db.refresh(assistant_message)
        return {
            "conversation_id": conversation.id,
            "message_id": user_message.id,
            "assistant_message_id": assistant_message.id,
            "answer": answer,
        }
    except ValueError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

@app.get("/api/v1/conversations/{conversation_id}/messages")
def list_conversation_messages(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
):
    db = SessionLocal()
    try:
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id,
        ).first()
        if conversation is None:
            raise HTTPException(
                status_code=404,
                detail=f"Conversation {conversation_id} not found",
            )

        return db.query(Message).filter(
            Message.conversation_id == conversation.id,
        ).order_by(Message.created_at, Message.id).all()
    finally:
        db.close()

# Protected trip endpoints

@app.post("/api/v1/trips")
def create_trip(
    request: TripRequest,
    current_user: User = Depends(get_current_user),
):
    total_estimated_cost = calculate_total_cost(
        request.hotel_cost,
        request.transportation_cost,
        request.food_cost,
        request.miscellaneous_cost,
    )
    budget_exceeded = total_estimated_cost > request.budget
    daily_budget = calculate_daily_budget(request.budget, request.days)
    
    # Temporary fallback values - will be overridden by AI after generation
    category = get_trip_category(request.budget)
    transportation = get_transportation_recommendation(category)
    season = get_season(request.travel_month)

    trip = Trip(
        user_id=current_user.id,
        destinations=request.destinations,
        country=request.country,
        days=request.days,
        budget=request.budget,
        hotel_cost=request.hotel_cost,
        transportation_cost=request.transportation_cost,
        food_cost=request.food_cost,
        miscellaneous_cost=request.miscellaneous_cost,
        total_estimated_cost=total_estimated_cost,
        budget_exceeded=budget_exceeded,
        currency=request.currency,
        travel_month=request.travel_month,
        daily_budget=daily_budget,
        category=category,
        recommendation_transport=transportation,
        season=season,
        travel_style=request.travel_style
    )

    # save to PostgreSQL
    db = SessionLocal()

    try:
        db.add(trip)
        db.commit()
        db.refresh(trip)
        return trip
    finally:
        db.close()

@app.get("/api/v1/trips")
async def list_trips(current_user: User = Depends(get_current_user)):
    from services.country_service import get_country_data
    
    db = SessionLocal()
    try:
        trips = db.query(Trip).filter(Trip.user_id == current_user.id).all()
        
        # Enrich trips with country data
        enriched_trips = []
        for trip in trips:
            trip_dict = {
                "id": trip.id,
                "user_id": trip.user_id,
                "destinations": trip.destinations,
                "country": trip.country,
                "days": trip.days,
                "budget": trip.budget,
                "hotel_cost": trip.hotel_cost,
                "transportation_cost": trip.transportation_cost,
                "food_cost": trip.food_cost,
                "miscellaneous_cost": trip.miscellaneous_cost,
                "total_estimated_cost": trip.total_estimated_cost,
                "budget_exceeded": trip.budget_exceeded,
                "currency": trip.currency,
                "travel_month": trip.travel_month,
                "category": trip.category,
                "daily_budget": trip.daily_budget,
                "recommendation_transport": trip.recommendation_transport,
                "season": trip.season,
                "travel_style": trip.travel_style,
                "created_at": trip.created_at,
                "ai_recommendations": trip.ai_recommendations,
                "trip_preferences": trip.trip_preferences,
            }
            
            # Fetch country data
            country_data = await get_country_data(trip.country)
            if country_data:
                trip_dict["country_flag"] = country_data.get("flag_png", "")
                trip_dict["country_code"] = country_data.get("code", "")
                trip_dict["country_emoji"] = country_data.get("flag_emoji", "🌍")
            else:
                trip_dict["country_flag"] = ""
                trip_dict["country_code"] = ""
                trip_dict["country_emoji"] = "🌍"
            
            enriched_trips.append(trip_dict)
        
        return enriched_trips
    finally:
        db.close()

@app.get("/api/v1/trips/{trip_id}")
async def get_trip(trip_id: int, current_user: User = Depends(get_current_user)):
    from services.country_service import get_country_data
    
    db = SessionLocal()
    try:
        trip = db.query(Trip).filter(
            Trip.id == trip_id,
            Trip.user_id == current_user.id,
        ).first()
    finally:
        db.close()

    # handling not found
    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip {trip_id} not found")
    
    # Convert to dict and enrich with country data
    trip_dict = {
        "id": trip.id,
        "user_id": trip.user_id,
        "destinations": trip.destinations,
        "country": trip.country,
        "days": trip.days,
        "budget": trip.budget,
        "hotel_cost": trip.hotel_cost,
        "transportation_cost": trip.transportation_cost,
        "food_cost": trip.food_cost,
        "miscellaneous_cost": trip.miscellaneous_cost,
        "total_estimated_cost": trip.total_estimated_cost,
        "budget_exceeded": trip.budget_exceeded,
        "currency": trip.currency,
        "travel_month": trip.travel_month,
        "category": trip.category,
        "daily_budget": trip.daily_budget,
        "recommendation_transport": trip.recommendation_transport,
        "season": trip.season,
        "travel_style": trip.travel_style,
        "created_at": trip.created_at,
        "ai_recommendations": trip.ai_recommendations,
        "trip_preferences": trip.trip_preferences,
    }
    
    # Fetch country data
    country_data = await get_country_data(trip.country)
    if country_data:
        trip_dict["country_flag"] = country_data.get("flag_png", "")
        trip_dict["country_code"] = country_data.get("code", "")
        trip_dict["country_emoji"] = country_data.get("flag_emoji", "🌍")
    else:
        trip_dict["country_flag"] = ""
        trip_dict["country_code"] = ""
        trip_dict["country_emoji"] = "🌍"
    
    return trip_dict

@app.put("/api/v1/trips/{trip_id}")
def update_trip(trip_id: int, request: TripRequest, current_user: User = Depends(get_current_user)):
    db = SessionLocal()

    try:
        trip = db.query(Trip).filter(
            Trip.id == trip_id,
            Trip.user_id == current_user.id,
        ).first()
        
        if trip is None:
            raise HTTPException(
                status_code=404,
                detail=f"Trip {trip_id} not found"
            )

        if request.budget is not None:
            trip.budget = request.budget
        if request.days is not None:
            trip.days = request.days
        if request.travel_style is not None:
            trip.travel_style = request.travel_style

        trip.daily_budget = calculate_daily_budget(trip.budget, trip.days)
        trip.category = get_trip_category(trip.budget)
        trip.recommendation_transport = get_transportation_recommendation(trip.category)
        trip.season = get_season(request.travel_month)
        trip.hotel_cost = request.hotel_cost
        trip.transportation_cost = request.transportation_cost
        trip.food_cost = request.food_cost
        trip.miscellaneous_cost = request.miscellaneous_cost
        total_estimated_cost = calculate_total_cost(
            request.hotel_cost,
            request.transportation_cost,
            request.food_cost,
            request.miscellaneous_cost,
        )
        trip.total_estimated_cost = total_estimated_cost
        trip.budget_exceeded = total_estimated_cost > request.budget
        trip.destinations = request.destinations
        trip.country = request.country
        trip.currency = request.currency
        trip.travel_month = request.travel_month

        db.commit()
        db.refresh(trip)
        return trip
    finally:
        db.close()

@app.delete("/api/v1/trips/{trip_id}")
def delete_trip(trip_id: int, current_user: User = Depends(get_current_user)):
    db = SessionLocal()

    try:
        trip = db.query(Trip).filter(
            Trip.id == trip_id,
            Trip.user_id == current_user.id,
        ).first()
        
        if trip is None:
            raise HTTPException(
                status_code=404,
                detail=f"Trip {trip_id} not found"
            )
            
        db.delete(trip)
        db.commit()
        return {"message": f"Trip with id {trip_id} deleted successfully"}
    finally:
        db.close()


# ── Trip refinement endpoints ────────────────────────────────────────────────

@app.get("/api/v1/trips/{trip_id}/conversation")
def get_or_create_trip_conversation(
    trip_id: int,
    current_user: User = Depends(get_current_user),
):
    """Get the existing conversation for this trip, or create one if it doesn't exist."""
    db = SessionLocal()
    try:
        # Verify trip ownership
        trip = db.query(Trip).filter(
            Trip.id == trip_id,
            Trip.user_id == current_user.id,
        ).first()
        if trip is None:
            raise HTTPException(status_code=404, detail=f"Trip {trip_id} not found")
        
        # Find existing conversation for this trip
        conversation = db.query(Conversation).filter(
            Conversation.trip_id == trip_id,
            Conversation.user_id == current_user.id,
        ).first()
        
        # Create if doesn't exist
        if conversation is None:
            conversation = Conversation(
                user_id=current_user.id,
                trip_id=trip_id,
                title=f"Refining {trip.destinations[0] if trip.destinations else trip.country} trip",
            )
            db.add(conversation)
            db.commit()
            db.refresh(conversation)
        
        return {
            "conversation_id": conversation.id,
            "trip_id": trip_id,
        }
    finally:
        db.close()


@app.post("/api/v1/trips/{trip_id}/refine", status_code=201)
def refine_trip(
    trip_id: int,
    request: MessageRequest,
    current_user: User = Depends(get_current_user),
):
    """Send a refinement request for the trip itinerary."""
    db = SessionLocal()
    try:
        # Get trip
        trip = db.query(Trip).filter(
            Trip.id == trip_id,
            Trip.user_id == current_user.id,
        ).first()
        if trip is None:
            raise HTTPException(status_code=404, detail=f"Trip {trip_id} not found")
        
        # Get or create conversation for this trip
        conversation = db.query(Conversation).filter(
            Conversation.trip_id == trip_id,
            Conversation.user_id == current_user.id,
        ).first()
        
        if conversation is None:
            conversation = Conversation(
                user_id=current_user.id,
                trip_id=trip_id,
                title=f"Refining {trip.destinations[0] if trip.destinations else trip.country} trip",
            )
            db.add(conversation)
            db.flush()
        
        # Save user message
        user_message = Message(
            conversation_id=conversation.id,
            role="user",
            content=request.content,
        )
        db.add(user_message)
        db.flush()
        
        # Get conversation history
        messages = db.query(Message).filter(
            Message.conversation_id == conversation.id,
        ).order_by(Message.created_at, Message.id).all()
        
        prompt = [
            {
                "role": message.role,
                "content": message.content,
            }
            for message in messages
        ]
        
        # Prepare trip context
        trip_context = {
            "id": trip.id,
            "destinations": trip.destinations,
            "country": trip.country,
            "days": trip.days,
            "budget": trip.budget,
            "currency": trip.currency,
            "travel_style": trip.travel_style,
            "travel_month": trip.travel_month,
            "category": trip.category,
            "ai_recommendations": trip.ai_recommendations,
            "trip_preferences": trip.trip_preferences,
        }
        
        # Get AI refinement response
        result = get_trip_refinement_response(prompt, trip_context)
        
        # Save assistant message
        assistant_message = Message(
            conversation_id=conversation.id,
            role="assistant",
            content=result["response_text"],
        )
        db.add(assistant_message)
        
        # Save preferences if any
        if result.get("preferences_to_save"):
            existing_prefs = []
            if trip.trip_preferences:
                try:
                    existing_prefs = json.loads(trip.trip_preferences)
                except:
                    existing_prefs = []
            
            # Merge new preferences
            all_prefs = list(set(existing_prefs + result["preferences_to_save"]))
            trip.trip_preferences = json.dumps(all_prefs)
        
        db.commit()
        db.refresh(user_message)
        db.refresh(assistant_message)
        
        return {
            "conversation_id": conversation.id,
            "message_id": user_message.id,
            "assistant_message_id": assistant_message.id,
            "response_text": result["response_text"],
            "requires_changes": result.get("requires_changes", False),
            "proposed_changes": result.get("proposed_changes"),
        }
    except ValueError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


@app.post("/api/v1/trips/{trip_id}/apply-changes")
def apply_trip_changes(
    trip_id: int,
    request: ApplyChangesRequest,
    current_user: User = Depends(get_current_user),
):
    """Apply proposed changes to the trip itinerary."""
    db = SessionLocal()
    try:
        trip = db.query(Trip).filter(
            Trip.id == trip_id,
            Trip.user_id == current_user.id,
        ).first()
        if trip is None:
            raise HTTPException(status_code=404, detail=f"Trip {trip_id} not found")
        
        # Get current recommendations
        if not trip.ai_recommendations:
            raise HTTPException(status_code=400, detail="Trip has no itinerary to modify")
        
        current_recs = json.loads(trip.ai_recommendations)
        proposed_changes = request.proposed_changes
        
        # Apply changes to daily_itinerary
        if "daily_itinerary" in proposed_changes:
            # Create a map of day -> new activities
            changes_by_day = {item["day"]: item for item in proposed_changes["daily_itinerary"]}
            
            # Update or append days
            existing_days = {item["day"]: item for item in current_recs.get("daily_itinerary", [])}
            for day_num, new_day in changes_by_day.items():
                existing_days[day_num] = new_day
            
            # Rebuild sorted daily itinerary
            current_recs["daily_itinerary"] = sorted(
                existing_days.values(),
                key=lambda x: x["day"]
            )
        
        # Save updated recommendations
        trip.ai_recommendations = json.dumps(current_recs)
        db.commit()
        db.refresh(trip)
        
        return {
            "trip_id": trip.id,
            "message": "Changes applied successfully",
            "updated_recommendation": current_recs,
        }
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid itinerary format")
    finally:
        db.close()


@app.post("/api/v1/trips/{trip_id}/generate")
def generate_ai_recommendations(
    trip_id: int,
    current_user: User = Depends(get_current_user),
):
    db = SessionLocal()
    trip = db.query(Trip).filter(
        Trip.id == trip_id,
        Trip.user_id == current_user.id,
    ).first()

    if trip is None:
        db.close()
        raise HTTPException(
            status_code=404,
            detail=f"Trip with id {trip_id} not found",
        )

    try:
        recommendation = get_ai_recommendations(
            days=trip.days,
            destinations=trip.destinations,
            country=trip.country,
            currency=trip.currency,
            budget=trip.budget,
            travel_style=trip.travel_style,
            travel_month=trip.travel_month,
            hotel_cost=trip.hotel_cost,
            transportation_cost=trip.transportation_cost,
            food_cost=trip.food_cost,
            miscellaneous_cost=trip.miscellaneous_cost,
        )
        trip.ai_recommendations = json.dumps(recommendation)
        
        # Extract AI-generated metadata and update trip
        if "category" in recommendation:
            trip.category = recommendation["category"]
        if "season" in recommendation:
            trip.season = recommendation["season"]
        if "recommended_transport" in recommendation:
            trip.recommendation_transport = recommendation["recommended_transport"]
        
        # If user didn't provide cost breakdown, use AI's estimates
        if "estimated_budget_breakdown" in recommendation:
            breakdown = recommendation["estimated_budget_breakdown"]
            if trip.hotel_cost is None and "accommodation" in breakdown:
                trip.hotel_cost = breakdown["accommodation"]
            if trip.transportation_cost is None and "transport" in breakdown:
                trip.transportation_cost = breakdown["transport"]
            if trip.food_cost is None and "food" in breakdown:
                trip.food_cost = breakdown["food"]
            if trip.miscellaneous_cost is None and ("activities" in breakdown or "other" in breakdown):
                trip.miscellaneous_cost = breakdown.get("activities", 0) + breakdown.get("other", 0)
            
            # Recalculate totals with AI values
            trip.total_estimated_cost = calculate_total_cost(
                trip.hotel_cost,
                trip.transportation_cost,
                trip.food_cost,
                trip.miscellaneous_cost,
            )
            trip.budget_exceeded = trip.total_estimated_cost > trip.budget
        
        db.commit()
        return {
            "trip_id": trip.id,
            "destination": trip.destinations,
            "country": trip.country,
            "recommendation": recommendation,
        }
    except Exception as error:
        db.rollback()
        raise HTTPException(
            status_code=502,
            detail=f"AI recommendation generation failed: {error}",
        ) from error
    finally:
        db.close()