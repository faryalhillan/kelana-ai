import json

from services.trip_service import calculate_total_cost, calculate_daily_budget, get_trip_category, get_transportation_recommendation, get_season
from services.bedrock_service import get_ai_recommendations
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from models.trip import Trip
from database import SessionLocal, init_db

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

@app.get("/")
def home():
    return {"message": "Welcome to KelanaAI!"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

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

@app.post("/api/v1/trips")
def create_trip(request: TripRequest):
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
    db.add(trip)
    db.commit()
    db.refresh(trip)  # get the auto-generated id
    db.close()

    return trip

@app.get("/api/v1/trips")
def list_trips():
    db = SessionLocal()
    trips = db.query(Trip).all()
    db.close()
    return trips

@app.get("/api/v1/trips/{trip_id}")
def get_trip(trip_id: int):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    db.close()

    # handling not found
    if trip is None:
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")

    return trip

@app.delete("/api/v1/trips/{trip_id}")
def delete_trip(trip_id: int):
    db = SessionLocal()

    trip = db.query(Trip).filter(Trip.id == trip_id).first()

    if trip is None:
        db.close()
        raise HTTPException(
            status_code=404,
            detail=f"Trip with id {trip_id} not found"
        )

    db.delete(trip)
    db.commit()
    db.close()

    return {"message": f"Trip with id {trip_id} deleted successfully"}


@app.put("/api/v1/trips/{trip_id}")
def update_trip(trip_id: int, request: TripRequest):
    db = SessionLocal()

    trip = db.query(Trip).filter(Trip.id == trip_id).first()

    if trip is None:
        db.close()
        raise HTTPException(
            status_code=404,
            detail=f"Trip with id {trip_id} not found"
        )

    daily_budget = calculate_daily_budget(request.budget, request.days)
    total_estimated_cost = calculate_total_cost(
        request.hotel_cost,
        request.transportation_cost,
        request.food_cost,
        request.miscellaneous_cost,
    )
    trip.hotel_cost = request.hotel_cost
    trip.transportation_cost = request.transportation_cost
    trip.food_cost = request.food_cost
    trip.miscellaneous_cost = request.miscellaneous_cost
    trip.total_estimated_cost = total_estimated_cost
    trip.budget_exceeded = total_estimated_cost > request.budget
    category = get_trip_category(request.budget)
    transportation = get_transportation_recommendation(category)
    season = get_season(request.travel_month)
    trip.destinations = request.destinations
    trip.country = request.country
    trip.days = request.days
    trip.budget = request.budget
    trip.currency = request.currency
    trip.travel_month = request.travel_month
    trip.travel_style = request.travel_style
    trip.daily_budget = daily_budget
    trip.category = category
    trip.recommendation_transport = transportation
    trip.season = season

    db.commit()
    db.refresh(trip)
    db.close()

    return trip


@app.post("/api/v1/trips/{trip_id}/generate")
def generate_ai_recommendations(trip_id: int):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()

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