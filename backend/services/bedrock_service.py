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
) -> str:
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

    Include:
    - Daily itenerary
    - 2-3 morning activites for each day
    - Afternoon activites with cultural sites and experience for each day
    - Evening activities with dinner spots and nightlife for each day
    - Local dishes and places to try them
    - Transportation suggestions between activities
    - Estimated daily costs for accommodation, food, transport, activities, and other expenses

    Keep the plan within budget where possible and state assumptions. Return Markdown (##) with headings and bullet lists (-). Do not return JSON, code fences, or meta-commentary.
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
    return response["output"]["message"]["content"][0]["text"]