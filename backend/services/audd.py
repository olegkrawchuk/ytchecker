"""AudD API client — track recognition from YouTube URL."""

from typing import Optional
import httpx

from backend.config import settings
from backend.models import TrackInfo

_AUDD_URL = "https://api.audd.io/"
_TIMEOUT = 20.0


async def recognize(youtube_url: str) -> tuple[TrackInfo, Optional[str]]:
    """
    Returns (TrackInfo, isrc_or_none).
    Raises httpx.HTTPError on network failure.
    """
    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        resp = await client.post(
            _AUDD_URL,
            data={
                "url": youtube_url,
                "return": "apple_music,spotify",
                "api_token": settings.audd_api_token,
            },
        )
        resp.raise_for_status()

    data = resp.json()

    if data.get("status") != "success" or not data.get("result"):
        return TrackInfo(recognized=False), None

    result = data["result"]

    isrc = None
    if result.get("apple_music"):
        isrc = result["apple_music"].get("isrc")

    track = TrackInfo(
        title=result.get("title"),
        artist=result.get("artist"),
        label=result.get("label"),
        release_date=result.get("release_date"),
        isrc=isrc,
        recognized=True,
    )
    return track, isrc
