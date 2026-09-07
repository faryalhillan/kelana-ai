def calculate_total_cost(
    hotel_cost,
    transportation_cost,
    food_cost,
    miscellaneous_cost
):
    return (
        (hotel_cost or 0) + 
        (transportation_cost or 0) + 
        (food_cost or 0) + 
        (miscellaneous_cost or 0)
    )

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

    # Peak travel seasons (Winter holidays, Summer vacation)
    if month in ("december", "12", "january", "1", "july", "7", "august", "8"):
        return "Peak Season"
    # Spring break and early summer
    elif month in ("march", "3", "april", "4", "may", "5", "june", "6"):
        return "Holiday Season"
    # Shoulder/off-peak seasons
    else:
        return "Regular Season"