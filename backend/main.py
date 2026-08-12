def print_trip_summary(destination, country, days, budget, currency, travel_month):
    print("===================")
    print("KelanaAI")
    print("===================")
    print(f"Destination  : {destination}")
    print(f"Country      : {country}")
    print(f"Duration     : {days} days")
    print(f"Budget       : {budget} {currency}")
    print(f"Currency     : {currency}")
    print(f"Travel Month : {travel_month}")

destination = str(input("Enter your destination: "))
country = str(input("Enter the country of your destination: "))
days = int(input("Enter the number of days for your trip: "))
budget = float(input("Enter your budget: "))
currency = str(input("Enter your preferred currency: "))
travel_month = str(input("Enter the month you plan to travel: "))

print_trip_summary(destination, country, days, budget, currency, travel_month)
