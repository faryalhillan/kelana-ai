from services.trip_service import calculate_daily_budget, get_trip_category, get_transportation_recommendation, get_season
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

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

    return {
        "destinations": request.destinations,
        "country": request.country,
        "days": request.days,
        "budget": request.budget,
        "currency": request.currency,
        "travel_month": request.travel_month,
        "daily_budget": daily_budget,
        "category": category,
        "recommendation_transport": transportation,
        "season": season,
        "travel_style": request.travel_style
    }

@app.get("/api/v1/trip-categories")
def get_trip_categories():
    categories = ["Backpacker", "Standard", "Luxury"]
    return categories

# def print_trip_summary(destinations, country, days, budget, currency, travel_month, daily, category):
#     print("===================")
#     print("KelanaAI")
#     print("===================")
#     print(f"Destination  : {destinations}")
#     print(f"Country      : {country}")
#     print(f"Duration     : {days} days")
#     print(f"Budget       : {budget:.2f} {currency}")
#     print(f"Daily Budget : {daily:.2f} {currency}")
#     print(f"Category     : {category}")
#     print(f"Currency     : {currency}")
#     print(f"Travel Month : {travel_month}")
#     print("Recommended Places:")
#     for place in recommended_places:
#         print(f"- {place}")
#     print(f"Recommended Transportation: {get_transportation_recommendation(category)}")
#     print(f"Recommended Season: {get_season(travel_month)}")

# recommended_places = ["Tokyo Tower", "Shibuya", "Mount_Fuji"]

# destinations = []

# while True:
#     place = str(input("Enter a destination (or type 'done' to finish): "))

#     if place.lower() == 'done':
#         break
#     destinations.append(place)

# print("Full trip itenerary:", destinations)
# country = str(input("Enter the country of your destination: "))
# days = int(input("Enter the number of days for your trip: "))
# budget = float(input("Enter your budget: "))
# currency = str(input("Enter your preferred currency: "))
# travel_month = str(input("Enter the month you plan to travel: "))


# daily = calculate_daily_budget(budget, days)
# category = get_trip_category(budget)
# print_trip_summary(destinations, country, days, budget, currency, travel_month, daily, category)
