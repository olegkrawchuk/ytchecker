import re
from urllib.parse import urlparse, parse_qs


def extract_video_id(url: str) -> str | None:
    """Extract YouTube video ID from various URL formats."""
    url = url.strip()

    # youtu.be/VIDEO_ID
    short = re.match(r"(?:https?://)?youtu\.be/([a-zA-Z0-9_-]{11})", url)
    if short:
        return short.group(1)

    parsed = urlparse(url)
    if parsed.hostname not in (
        "www.youtube.com",
        "youtube.com",
        "m.youtube.com",
        "music.youtube.com",
    ):
        return None

    # /watch?v=VIDEO_ID
    if parsed.path == "/watch":
        qs = parse_qs(parsed.query)
        ids = qs.get("v")
        if ids:
            return ids[0]

    # /shorts/VIDEO_ID or /embed/VIDEO_ID or /v/VIDEO_ID
    match = re.match(r"/(?:shorts|embed|v)/([a-zA-Z0-9_-]{11})", parsed.path)
    if match:
        return match.group(1)

    return None


def validate_youtube_url(url: str) -> bool:
    return extract_video_id(url) is not None
