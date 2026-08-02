from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, HttpUrl


class CheckRequest(BaseModel):
    url: str
    region: str = "US"
    mock: bool = False


class TrackInfo(BaseModel):
    title: Optional[str] = None
    artist: Optional[str] = None
    label: Optional[str] = None
    release_date: Optional[str] = None
    isrc: Optional[str] = None
    recognized: bool = False


class CheckResult(BaseModel):
    status: Literal["GREEN", "YELLOW", "RED"]
    live_verdict: str
    vod_verdict: str
    confidence: Literal["HIGH", "MEDIUM", "LOW"]
    track: TrackInfo
    signals: dict
    checked_at: datetime
    disclaimer: str = (
        "Це оцінка ризику, а не офіційне підтвердження YouTube. "
        "Policy правовласника може змінитись будь-коли. "
        "Перевіряйте перед кожним стрімом."
    )
