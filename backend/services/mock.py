"""Deterministic mock responses for dev/test — no network calls."""

from backend.models import TrackInfo

_MOCKS = [
    {
        "track": TrackInfo(
            title="Free Music",
            artist="Indie Artist",
            label="",
            release_date="2023-01-01",
            isrc=None,
            recognized=True,
        ),
        "right_policy": "Allow",
        "region_restricted": False,
        "license_type": None,
    },
    {
        "track": TrackInfo(
            title="Pop Song",
            artist="Pop Artist",
            label="Sony Music Entertainment",
            release_date="2024-03-15",
            isrc="USSM12345678",
            recognized=True,
        ),
        "right_policy": "Monetize",
        "region_restricted": False,
        "license_type": None,
    },
    {
        "track": TrackInfo(
            title="Warriors",
            artist="Imagine Dragons",
            label="Universal Music Group",
            release_date="2014-09-18",
            isrc="USUM71408585",
            recognized=True,
        ),
        "right_policy": "BlockAccess",
        "region_restricted": False,
        "license_type": None,
    },
]


def get_mock_data(video_id: str) -> dict:
    idx = sum(ord(c) for c in video_id) % len(_MOCKS)
    return _MOCKS[idx]
