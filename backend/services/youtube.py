"""YouTube Data API v3 client — license and region restriction signals."""

from typing import Optional
import httpx

from backend.config import settings

_YT_API_URL = "https://www.googleapis.com/youtube/v3/videos"
_TIMEOUT = 8.0


async def get_video_signals(video_id: str) -> dict:
    """
    Returns dict with:
      - region_restricted: bool or None
      - license_type: 'youtube' | 'creativeCommon' | None
    None means not configured or API unavailable.
    """
    if not settings.youtube_configured:
        return {"region_restricted": None, "license_type": None}

    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
            resp = await client.get(
                _YT_API_URL,
                params={
                    "part": "status,contentDetails",
                    "id": video_id,
                    "key": settings.youtube_data_api_key,
                },
            )
            resp.raise_for_status()

        data = resp.json()
        items = data.get("items", [])

        if not items:
            return {"region_restricted": None, "license_type": None}

        item = items[0]
        content_details = item.get("contentDetails", {})
        status = item.get("status", {})

        region_restriction = content_details.get("regionRestriction", {})
        region_restricted = bool(
            region_restriction.get("blocked") or region_restriction.get("allowed")
        )

        license_type = status.get("license")  # 'youtube' or 'creativeCommon'

        return {
            "region_restricted": region_restricted,
            "license_type": license_type,
        }

    except Exception:
        return {"region_restricted": None, "license_type": None}
