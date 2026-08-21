from services.trip_service import calculate_daily_budget, get_trip_category, get_transportation_recommendation, get_season
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from models.trip import Trip
from database import SessionLocal, init_db

app = FastAPI()

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
    currency: str
    travel_month: str
    travel_style: str

@app.post("/api/v1/trips")
def create_trip(request: TripRequest):
    daily_budget = calculate_daily_budget(request.budget, request.days)
    category = get_trip_category(request.budget)
    transportation = get_transportation_recommendation(category)
    season = get_season(request.travel_month)

    trip = Trip(
        destinations=request.destinations,
        country=request.country,
        days=request.days,
        budget=request.budget,
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

@app.get("/api/v1/trip-categories")
def get_trip_categories():
    categories = ["Backpacker", "Standard", "Luxury"]
    return categories

@app.get("/api/v1/recommendations")
def get_recommendations():
    recommendations = ["Tokyo Tower", "Shibuya", "Mount Fuji"]
    return recommendations

@app.get("/api/v1/transportations")
def get_transportations():
    transportations = ["Bus", "Train", "Flight"]
    return transportations