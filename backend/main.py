from services.trip_service import calculate_daily_budget, get_trip_category, get_transportation_recommendation, get_season

def print_trip_summary(destinations, country, days, budget, currency, travel_month, daily, category):
    print("===================")
    print("KelanaAI")
    print("===================")
    print(f"Destination  : {destinations}")
    print(f"Country      : {country}")
    print(f"Duration     : {days} days")
    print(f"Budget       : {budget:.2f} {currency}")
    print(f"Daily Budget : {daily:.2f} {currency}")
    print(f"Category     : {category}")
    print(f"Currency     : {currency}")
    print(f"Travel Month : {travel_month}")
    print("Recommended Places:")
    for place in recommended_places:
        print(f"- {place}")
    print(f"Recommended Transportation: {get_transportation_recommendation(category)}")
    print(f"Recommended Season: {get_season(travel_month)}")

recommended_places = ["Tokyo Tower", "Shibuya", "Mount_Fuji"]

destinations = []

while True:
    place = str(input("Enter a destination (or type 'done' to finish): "))

    if place.lower() == 'done':
        break
    destinations.append(place)

print("Full trip itenerary:", destinations)
country = str(input("Enter the country of your destination: "))
days = int(input("Enter the number of days for your trip: "))
budget = float(input("Enter your budget: "))
currency = str(input("Enter your preferred currency: "))
travel_month = str(input("Enter the month you plan to travel: "))


daily = calculate_daily_budget(budget, days)
category = get_trip_category(budget)
print_trip_summary(destinations, country, days, budget, currency, travel_month, daily, category)
