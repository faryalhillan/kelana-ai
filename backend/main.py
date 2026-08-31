import json
import os
from dotenv import load_dotenv

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator

from services.trip_service import calculate_total_cost, calculate_daily_budget, get_trip_category, get_transportation_recommendation, get_season
from services.bedrock_service import get_ai_recommendations
from services.auth_service import register_user, login_user, get_current_user

from models.trip import Trip
from models.user import User
from database import SessionLocal, init_db

load_dotenv()

# Request schemas

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

class LoginRequest(BaseModel):
    email:    str
    password: str

    @field_validator("email")
    @classmethod
    def email_must_contain_at(cls, v: str) -> str:
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("Invalid email address")
        return v.lower().strip()

class TripRequest(BaseModel):
    destinations: list[str]
    country: str
    days: int
    budget: float
    hotel_cost: float = 0
    transportation_cost: float = 0
    food_cost: float = 0
    miscellaneous_cost: float = 0
    currency: str
    travel_month: str
    travel_style: str

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
def list_trips(current_user: User = Depends(get_current_user)):
    db = SessionLocal()
    try:
        return db.query(Trip).filter(Trip.user_id == current_user.id).all()
    finally:
        db.close()

@app.get("/api/v1/trips/{trip_id}")
def get_trip(trip_id: int, current_user: User = Depends(get_current_user)):
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
    return trip

@app.put("/api/v1/trips/{trip_id}")
def update_trip(trip_id: int, request: TripRequest, current_user: User = Depends(get_current_user)):
    db = SessionLocal()

    try:
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if trip is None:
            raise HTTPException(
                status_code=404,
                detail=f"Trip {trip_id} not found"
            )
        if trip.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="You do not own this trip")

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
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if trip is None:
            raise HTTPException(
                status_code=404,
                detail=f"Trip {trip_id} not found"
            )
        if trip.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="You do not own this trip")
        db.delete(trip)
        db.commit()
        return {"message": f"Trip with id {trip_id} deleted successfully"}
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
        )
        trip.ai_recommendations = json.dumps(recommendation)
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