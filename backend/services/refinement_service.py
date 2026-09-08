"""
Service for AI-powered trip refinement using Amazon Bedrock.
"""
import json
from typing import Optional
from botocore.client import BaseClient

from services.bedrock_service import configure_bedrock, MODEL_ID


def get_trip_refinement_response(
    prompt: list[dict[str, str]],
    trip_context: dict,
    client: Optional[BaseClient] = None,
) -> dict:
    """
    Call Amazon Bedrock with trip context and conversation history.
    
    Returns a structured response indicating whether changes are proposed.
    
    Args:
        prompt: Conversation history as role/content dictionaries
        trip_context: Current trip and itinerary details
        client: Optional boto3 Bedrock client
        
    Returns:
        {
            "response_text": str,  # The AI's conversational response
            "requires_changes": bool,  # Whether this requires itinerary changes
            "proposed_changes": dict | None,  # If requires_changes, the structured changes
        }
    """
    bedrock_client = client or configure_bedrock()
    
    # Build system context with trip information
    trip_summary = f"""
TRIP CONTEXT:
Destination: {trip_context.get('destinations', [])} in {trip_context.get('country', '')}
Duration: {trip_context.get('days', 0)} days
Budget: {trip_context.get('currency', '')} {trip_context.get('budget', 0)}
Travel Style: {trip_context.get('travel_style', '')}
Travel Month: {trip_context.get('travel_month', '')}
Category: {trip_context.get('category', '')}
"""
    
    if trip_context.get('ai_recommendations'):
        try:
            recommendations = json.loads(trip_context['ai_recommendations'])
            trip_summary += f"\nCURRENT ITINERARY:\n{json.dumps(recommendations.get('daily_itinerary', []), indent=2)}\n"
            if trip_context.get('trip_preferences'):
                trip_summary += f"\nUSER PREFERENCES: {trip_context['trip_preferences']}\n"
        except:
            pass
    
    system_prompt = f"""{trip_summary}

You are KelanaAI, an AI travel copilot helping the user refine their trip itinerary.

IMPORTANT INSTRUCTIONS:
1. If the user asks a QUESTION or wants INFORMATION (e.g., "What's the weather like?", "Tell me about halal food"), just answer conversationally. Set requires_changes to false.

2. If the user requests a CHANGE to the itinerary (e.g., "Make it more anime-focused", "Less walking", "Replace Day 2 dinner", "Add more food experiences"), you MUST:
   - Set requires_changes to true
   - Describe what will change in response_text
   - Provide structured proposed_changes with ONLY the days/activities that will change
   - Do NOT actually modify anything yet - the user will review and apply

3. If the user's request reveals an ongoing PREFERENCE (e.g., "only halal food", "no early mornings", "focus on anime"), extract it and include in preferences_to_save.

Response format:
{{
    "response_text": "Your conversational response to the user",
    "requires_changes": true/false,
    "proposed_changes": {{
        "daily_itinerary": [
            {{"day": 1, "title": "...", "morning": [...], "afternoon": [...], "evening": [...], "estimated_cost": 0}}
        ],
        "change_summary": "Brief description of what changed"
    }} or null,
    "preferences_to_save": ["preference1", "preference2"] or null
}}

Keep your response_text friendly and helpful. When proposing changes, explain WHAT will change before the user applies it."""
    
    # Prepare messages with system context
    messages = [
        {
            "role": "user",
            "content": [{"text": system_prompt}],
        },
        {
            "role": "assistant",
            "content": [{"text": "I understand. I'll help refine your trip, propose changes when needed, and extract preferences."}],
        }
    ]
    
    # Add conversation history
    for item in prompt:
        messages.append({
            "role": item["role"],
            "content": [{"text": item["content"]}],
        })
    
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
    raw_response = "\n".join(text_parts).strip()
    
    # Parse the structured response
    try:
        # Try to extract JSON from the response
        if "```json" in raw_response:
            json_start = raw_response.find("```json") + 7
            json_end = raw_response.find("```", json_start)
            raw_response = raw_response[json_start:json_end].strip()
        elif "```" in raw_response:
            json_start = raw_response.find("```") + 3
            json_end = raw_response.find("```", json_start)
            raw_response = raw_response[json_start:json_end].strip()
            
        parsed = json.loads(raw_response)
        
        return {
            "response_text": parsed.get("response_text", raw_response),
            "requires_changes": parsed.get("requires_changes", False),
            "proposed_changes": parsed.get("proposed_changes"),
            "preferences_to_save": parsed.get("preferences_to_save"),
        }
    except (json.JSONDecodeError, KeyError):
        # Fallback: treat as simple conversational response
        return {
            "response_text": raw_response,
            "requires_changes": False,
            "proposed_changes": None,
            "preferences_to_save": None,
        }
