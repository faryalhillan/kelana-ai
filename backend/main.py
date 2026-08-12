from services.trip_service import calculate_daily_budget, get_trip_category

def print_trip_summary(destination, country, days, budget, currency, travel_month, daily, category):
    print("===================")
    print("KelanaAI")
    print("===================")
    print(f"Destination  : {destination}")
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

recommended_places = ["Tokyo Tower", "Shibuya", "Mount_Fuji"]
destination = str(input("Enter your destination: "))
country = str(input("Enter the country of your destination: "))
days = int(input("Enter the number of days for your trip: "))
budget = float(input("Enter your budget: "))
currency = str(input("Enter your preferred currency: "))
travel_month = str(input("Enter the month you plan to travel: "))

daily = calculate_daily_budget(budget, days)
category = get_trip_category(budget)
print_trip_summary(destination, country, days, budget, currency, travel_month, daily, category)
