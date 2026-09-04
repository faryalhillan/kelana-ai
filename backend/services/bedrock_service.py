import json
import os
from typing import Optional, Sequence

import boto3
from botocore.client import BaseClient
from dotenv import load_dotenv

load_dotenv()

AWS_BEARER_TOKEN_BEDROCK = os.getenv("AWS_BEARER_TOKEN_BEDROCK")
AWS_REGION = os.getenv("AWS_REGION", "ap-southeast-2")
MODEL_ID = os.getenv("MODEL_ID", "amazon.nova-lite-v1:0")

def configure_bedrock(api_key: Optional[str] = None) -> BaseClient:
    """
    Build and return a boto3 Bedrock Runtime client.

    Authentication uses the inline Bedrock API key stored in
    AWS_BEARER_TOKEN_BEDROCK.  boto3 accepts this through the
    ``aws_bearer_token`` token provider introduced in botocore 1.35+.
    """
    if not AWS_BEARER_TOKEN_BEDROCK:
        raise ValueError(
            "AWS_BEARER_TOKEN_BEDROCK is not set. "
            "Check your .env file."
        )

    client = boto3.client(
        service_name="bedrock-runtime",
        region_name=AWS_REGION,
    )
    return client


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
    MODEL_ID = os.getenv("MODEL_ID")
    if not MODEL_ID:
        raise RuntimeError("MODEL_ID is not configured")

    response = bedrock_client.converse(
        modelId=MODEL_ID,
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

def get_chat_response(prompt: list[dict[str, str]]) -> str:
    """
    Call Amazon Bedrock with conversational history and return the assistant
    response as a plain string.

    Args:
        prompt: Conversation history as role/content dictionaries.

    Returns:
        The model's text response.
    """
    bedrock_client = configure_bedrock()

    messages = [
        {
            "role": item["role"],
            "content": [{"text": item["content"]}],
        }
        for item in prompt
    ]

    response = bedrock_client.converse(
        modelId=MODEL_ID,
        messages=messages,
    )

    output_message = response["output"]["message"]
    text_parts = [
        block["text"]
        for block in output_message["content"]
        if "text" in block
    ]
    return "\n".join(text_parts)