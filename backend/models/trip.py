from sqlalchemy import Boolean, Column, Integer, String, Float, JSON, Text, DateTime
from sqlalchemy.sql import func

from database import Base


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True)
    destinations = Column(JSON, nullable=False)
    country = Column(String, nullable=False)
    days = Column(Integer, nullable=False)
    budget = Column(Float, nullable=False)
    hotel_cost = Column(Float, nullable=False, default=0)
    transportation_cost = Column(Float, nullable=False, default=0)
    food_cost = Column(Float, nullable=False, default=0)
    miscellaneous_cost = Column(Float, nullable=False, default=0)
    total_estimated_cost = Column(Float, nullable=False, default=0)
    budget_exceeded = Column(Boolean, nullable=False, default=False)
    currency = Column(String, nullable=False)
    travel_month = Column(String, nullable=False)
    category = Column(String, nullable=False)
    daily_budget = Column(Float, nullable=False)
    recommendation_transport = Column(String, nullable=False)
    season = Column(String, nullable=False)
    travel_style = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default = func.now(), nullable=False)
    ai_recommendations = Column(Text, nullable=True)
