import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from backend.utils import extract_video_id, validate_youtube_url

VIDEO_ID = "dQw4w9WgXcQ"


def test_standard_watch_url():
    assert extract_video_id(f"https://www.youtube.com/watch?v={VIDEO_ID}") == VIDEO_ID


def test_watch_url_without_www():
    assert extract_video_id(f"https://youtube.com/watch?v={VIDEO_ID}") == VIDEO_ID


def test_watch_url_with_extra_params():
    assert extract_video_id(f"https://www.youtube.com/watch?v={VIDEO_ID}&t=30s&list=PL123") == VIDEO_ID


def test_short_url():
    assert extract_video_id(f"https://youtu.be/{VIDEO_ID}") == VIDEO_ID


def test_short_url_with_params():
    assert extract_video_id(f"https://youtu.be/{VIDEO_ID}?t=42") == VIDEO_ID


def test_shorts_url():
    assert extract_video_id(f"https://www.youtube.com/shorts/{VIDEO_ID}") == VIDEO_ID


def test_embed_url():
    assert extract_video_id(f"https://www.youtube.com/embed/{VIDEO_ID}") == VIDEO_ID


def test_mobile_url():
    assert extract_video_id(f"https://m.youtube.com/watch?v={VIDEO_ID}") == VIDEO_ID


def test_invalid_domain():
    assert extract_video_id("https://vimeo.com/watch?v=dQw4w9WgXcQ") is None


def test_invalid_url():
    assert extract_video_id("not-a-url") is None


def test_empty_string():
    assert extract_video_id("") is None


def test_validate_valid():
    assert validate_youtube_url(f"https://www.youtube.com/watch?v={VIDEO_ID}") is True


def test_validate_invalid():
    assert validate_youtube_url("https://example.com") is False
