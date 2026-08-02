from datetime import datetime, timezone
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from backend.cache import Cache
from backend.classifier import classify_risk
from backend.config import settings
from backend.models import CheckRequest, CheckResult, TrackInfo
from backend.services import mock as mock_service
from backend.services import audd, acrcloud, youtube
from backend.utils import extract_video_id, validate_youtube_url

app = FastAPI(title="YouTube Copyright Checker", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

_cache = Cache(redis_url=settings.redis_url, ttl=settings.cache_ttl_seconds)

_MOCK_EXAMPLES = None  # lazily built


@app.get("/api/health")
async def health() -> dict:
    return {
        "status": "ok",
        "apis_configured": {
            "audd": settings.audd_configured,
            "acrcloud": settings.acrcloud_configured,
            "youtube": settings.youtube_configured,
        },
        "mock_mode": settings.mock_mode,
    }


@app.get("/api/mock-examples")
async def mock_examples() -> list[dict]:
    """Three hardcoded examples (GREEN/YELLOW/RED) for UI development."""
    results = []
    sample_ids = ["dQw4w9WgXcQ", "kJQP7kiw5Fk", "9bZkp7q19f0"]
    for vid in sample_ids:
        data = mock_service.get_mock_data(vid)
        classification = classify_risk(
            right_policy=data["right_policy"],
            label=data["track"].label,
            region_restricted=data["region_restricted"],
            license_type=data["license_type"],
        )
        result = CheckResult(
            status=classification["status"],
            live_verdict=classification["live_verdict"],
            vod_verdict=classification["vod_verdict"],
            confidence=classification["confidence"],
            track=data["track"],
            signals=classification["signals"],
            checked_at=datetime.now(timezone.utc),
        )
        results.append(result.model_dump(mode="json"))
    return results


@app.post("/api/check")
async def check(req: CheckRequest) -> dict:
    if not validate_youtube_url(str(req.url)):
        raise HTTPException(status_code=400, detail="Невалідний YouTube URL.")

    video_id = extract_video_id(str(req.url))

    # Cache lookup
    cache_key = f"{video_id}:{req.region}"
    cached = await _cache.get(cache_key)
    if cached and not req.mock:
        return cached

    # Mock mode
    if req.mock or settings.mock_mode:
        data = mock_service.get_mock_data(video_id)
        classification = classify_risk(
            right_policy=data["right_policy"],
            label=data["track"].label,
            region_restricted=data["region_restricted"],
            license_type=data["license_type"],
        )
        result = CheckResult(
            status=classification["status"],
            live_verdict=classification["live_verdict"],
            vod_verdict=classification["vod_verdict"],
            confidence=classification["confidence"],
            track=data["track"],
            signals=classification["signals"],
            checked_at=datetime.now(timezone.utc),
        )
        return result.model_dump(mode="json")

    # Real pipeline
    if not settings.audd_configured:
        raise HTTPException(
            status_code=503,
            detail="AudD API не налаштований. Додайте AUDD_API_TOKEN до .env.",
        )

    # Step 1: AudD — track recognition
    try:
        track, isrc = await audd.recognize(str(req.url))
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"AudD API недоступний: {exc}")

    # Step 2: ACRCloud — right_policy (optional)
    right_policy = None
    if settings.acrcloud_configured:
        right_policy = await acrcloud.get_right_policy(str(req.url))

    # Step 3: YouTube Data API — region/license signals (optional)
    yt_signals = await youtube.get_video_signals(video_id)

    # Step 4: Classify
    classification = classify_risk(
        right_policy=right_policy,
        label=track.label,
        region_restricted=yt_signals["region_restricted"],
        license_type=yt_signals["license_type"],
    )

    result = CheckResult(
        status=classification["status"],
        live_verdict=classification["live_verdict"],
        vod_verdict=classification["vod_verdict"],
        confidence=classification["confidence"],
        track=track,
        signals=classification["signals"],
        checked_at=datetime.now(timezone.utc),
    )

    payload = result.model_dump(mode="json")
    await _cache.set(cache_key, payload)
    return payload


# Serve frontend static files in production (same origin)
_frontend_dir = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.isdir(_frontend_dir):
    app.mount("/", StaticFiles(directory=_frontend_dir, html=True), name="frontend")
