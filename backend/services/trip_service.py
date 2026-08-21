def calculate_total_cost(
    hotel_cost,
    transportation_cost,
    food_cost,
    miscellaneous_cost
):
    return (hotel_cost + transportation_cost + food_cost + miscellaneous_cost)

def calculate_daily_budget(budget, days):
    return budget/days

def get_trip_category(budget):
    if budget < 1000:
        return "Backpacker"
    elif budget <= 3000:
        return "Standard"
    else:
        return "Luxury"

def get_transportation_recommendation(category):
    if category.lower() == "backpacker":
        return "Bus"
    elif category.lower() == "standard":
        return "Train"
    else:
        return "Flight"

def get_season(travel_month):
    month = travel_month.strip().lower()

    if month in ("december", "12"):
        return "Peak Season"
    elif month in ("june", "6"):
        return "Holiday Season"
    else:
        return "Regular Season"