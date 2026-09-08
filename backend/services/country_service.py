"""
Country service for fetching country data from RestCountries API v5 with caching.
"""

import os
import httpx
from typing import Optional, Dict
from datetime import datetime, timedelta

# In-memory cache for country data
# Structure: {country_name: {data: {...}, expires_at: datetime}}
_country_cache: Dict[str, Dict] = {}
CACHE_DURATION = timedelta(days=7)  # Cache for 7 days


def _get_cache_key(country_name: str) -> str:
    """Generate a cache key from country name."""
    return country_name.lower().strip()


def _is_cache_valid(cache_entry: Dict) -> bool:
    """Check if cache entry is still valid."""
    return cache_entry.get("expires_at") and cache_entry["expires_at"] > datetime.utcnow()


async def get_country_data(country_name: str) -> Optional[Dict]:
    """
    Fetch country data from RestCountries API v5 with caching.
    
    Args:
        country_name: Name of the country to fetch data for
        
    Returns:
        Dictionary containing country data with flag URL and other info, or None if not found
    """
    if not country_name:
        return None
    
    cache_key = _get_cache_key(country_name)
    
    # Check cache first
    if cache_key in _country_cache:
        cache_entry = _country_cache[cache_key]
        if _is_cache_valid(cache_entry):
            print(f"Using cached country data for: {country_name}")
            return cache_entry["data"]
        else:
            # Remove expired cache entry
            del _country_cache[cache_key]
    
    # Fetch from API
    api_key = os.getenv("RESTCOUNTRIES_API_KEY")
    if not api_key:
        print("Warning: RESTCOUNTRIES_API_KEY not set in environment")
        return None
    
    try:
        async with httpx.AsyncClient() as client:
            # RestCountries v5 API endpoint with query parameter
            url = f"https://api.restcountries.com/countries/v5?q={country_name}"
            
            headers = {
                "Authorization": f"Bearer {api_key}"
            }
            
            response = await client.get(url, headers=headers, timeout=10.0)
            
            if response.status_code == 200:
                response_data = response.json()
                
                # v5 API wraps data in {"data": {"objects": [...]}}
                objects = response_data.get("data", {}).get("objects", [])
                if objects and len(objects) > 0:
                    data = objects[0]
                    
                    # Extract useful data from v5 format
                    country_data = {
                        "name": data.get("names", {}).get("common", country_name),
                        "official_name": data.get("names", {}).get("official", ""),
                        "flag_png": data.get("flag", {}).get("url_png", ""),
                        "flag_svg": data.get("flag", {}).get("url_svg", ""),
                        "flag_emoji": data.get("flag", {}).get("emoji", "🌍"),
                        "code": data.get("codes", {}).get("alpha_2", ""),  # 2-letter country code
                        "code3": data.get("codes", {}).get("alpha_3", ""),  # 3-letter country code
                        "capital": data.get("capitals", [{}])[0].get("name", "") if data.get("capitals") else "",
                        "region": data.get("region", ""),
                        "subregion": data.get("subregion", ""),
                        "languages": [lang.get("name", "") for lang in data.get("languages", [])],
                        "currencies": [curr.get("code", "") for curr in data.get("currencies", [])],
                        "population": data.get("population", 0),
                    }
                    
                    # Cache the result
                    _country_cache[cache_key] = {
                        "data": country_data,
                        "expires_at": datetime.utcnow() + CACHE_DURATION
                    }
                    
                    print(f"Successfully fetched country data for: {country_name} - Flag: {country_data['flag_png']}")
                    return country_data
                else:
                    print(f"No country data found for: {country_name}")
                    return None
            elif response.status_code == 404:
                print(f"Country not found: {country_name}")
                return None
            else:
                print(f"RestCountries API error: {response.status_code} - {response.text}")
                return None
                
    except httpx.TimeoutException:
        print(f"Timeout fetching country data for: {country_name}")
        return None
    except Exception as e:
        print(f"Error fetching country data for {country_name}: {str(e)}")
        import traceback
        traceback.print_exc()
        return None


async def get_all_countries() -> list[Dict]:
    """
    Fetch list of all countries from RestCountries API v5 with caching.
    
    Returns:
        List of country dictionaries with name, code, and flag
    """
    cache_key = "all_countries"
    
    # Check cache first
    if cache_key in _country_cache:
        cache_entry = _country_cache[cache_key]
        if _is_cache_valid(cache_entry):
            print("Using cached all countries data")
            return cache_entry["data"]
        else:
            # Remove expired cache entry
            del _country_cache[cache_key]
    
    # Fetch from API
    api_key = os.getenv("RESTCOUNTRIES_API_KEY")
    if not api_key:
        print("Warning: RESTCOUNTRIES_API_KEY not set in environment")
        return []
    
    try:
        async with httpx.AsyncClient() as client:
            # Get all countries - v5 API endpoint
            url = "https://api.restcountries.com/countries/v5"
            
            headers = {
                "Authorization": f"Bearer {api_key}"
            }
            
            response = await client.get(url, headers=headers, timeout=15.0)
            
            if response.status_code == 200:
                response_data = response.json()
                
                # v5 API wraps data in {"data": {"objects": [...]}}
                objects = response_data.get("data", {}).get("objects", [])
                
                # Extract and format country data
                countries = []
                for country_info in objects:
                    country_data = {
                        "name": country_info.get("names", {}).get("common", ""),
                        "official_name": country_info.get("names", {}).get("official", ""),
                        "code": country_info.get("codes", {}).get("alpha_2", ""),
                        "code3": country_info.get("codes", {}).get("alpha_3", ""),
                        "flag_emoji": country_info.get("flag", {}).get("emoji", "🌍"),
                        "flag_png": country_info.get("flag", {}).get("url_png", ""),
                    }
                    if country_data["name"]:
                        countries.append(country_data)
                
                # Sort alphabetically by name
                countries.sort(key=lambda x: x["name"])
                
                # Cache the result
                _country_cache[cache_key] = {
                    "data": countries,
                    "expires_at": datetime.utcnow() + CACHE_DURATION
                }
                
                print(f"Successfully fetched {len(countries)} countries")
                return countries
            else:
                print(f"RestCountries API error: {response.status_code}")
                return []
                
    except Exception as e:
        print(f"Error fetching all countries: {str(e)}")
        import traceback
        traceback.print_exc()
        return []


def clear_cache():
    """Clear the entire country cache."""
    global _country_cache
    _country_cache = {}


def get_cache_stats() -> Dict:
    """Get cache statistics for monitoring."""
    valid_entries = sum(1 for entry in _country_cache.values() if _is_cache_valid(entry))
    return {
        "total_entries": len(_country_cache),
        "valid_entries": valid_entries,
        "expired_entries": len(_country_cache) - valid_entries
    }
