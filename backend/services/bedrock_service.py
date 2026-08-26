import json
import os
from typing import Optional, Sequence

import boto3
from botocore.client import BaseClient
from dotenv import load_dotenv

load_dotenv()

def configure_bedrock(api_key: Optional[str] = None) -> BaseClient:
    """Create a Bedrock Runtime client using values from the environment."""
    bearer_token = api_key or os.getenv("AWS_BEARER_TOKEN_BEDROCK")
    region = os.getenv("AWS_REGION")

    if not bearer_token:
        raise RuntimeError("AWS_BEARER_TOKEN_BEDROCK is not configured")
    if not region:
        raise RuntimeError("AWS_REGION is not configured")

    os.environ["AWS_BEARER_TOKEN_BEDROCK"] = bearer_token
    return boto3.client("bedrock-runtime", region_name=region)


def get_ai_recommendations(
    days: int,
    destinations: Sequence[str] | str,
    country: str,
    currency: str,
    budget: float,
    travel_style: str,
    travel_month: str,
    client: Optional[BaseClient] = None,
) -> dict:
    """Generate a travel itinerary from the supplied trip details."""
    if days < 1:
        raise ValueError("days must be at least 1")

    destination_text = (
        destinations if isinstance(destinations, str) else ", ".join(destinations)
    )
    prompt = f"""
    Create a {days}-day itinerary for {destination_text}, {country}.
    Budget: {currency} {budget}
    Style: {travel_style}
    Month: {travel_month}

        Return ONLY valid JSON. Do not use Markdown, code fences, or meta-commentary.
        Use exactly this shape:
        {{
            "title": "Short itinerary title",
            "daily_itinerary": [
                {{"day": 1, "title": "Day title", "morning": ["activity"], "afternoon": ["activity"], "evening": ["activity"], "estimated_cost": 0}}
            ],
            "travel_tips": ["practical tip"],
            "local_food_recommendations": ["dish and where to try it"],
            "estimated_budget_breakdown": {{"accommodation": 0, "food": 0, "transport": 0, "activities": 0, "other": 0, "total": 0}},
            "assumptions": ["planning assumption"]
        }}
        Include 2-3 activities in each daily period. Keep the plan within budget where possible.
    """

    bedrock_client = client or configure_bedrock()
    model_id = os.getenv("MODEL_ID")
    if not model_id:
        raise RuntimeError("MODEL_ID is not configured")

    response = bedrock_client.converse(
        modelId=model_id,
        messages=[
            {
                "role": "user",
                "content": [{"text": prompt}],
            }
        ],
    )
    raw_recommendation = response["output"]["message"]["content"][0]["text"].strip()
    try:
        return json.loads(raw_recommendation)
    except json.JSONDecodeError as error:
        raise ValueError("Bedrock returned invalid itinerary JSON") from error