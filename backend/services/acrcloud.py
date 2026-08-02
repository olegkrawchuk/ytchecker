"""ACRCloud client — returns right_policy field.

Returns None immediately if access keys are not configured.
Uses HMAC-SHA1 request signing as required by ACRCloud API.
"""

import base64
import hashlib
import hmac
import time
from typing import Optional

import httpx

from backend.config import settings

_TIMEOUT = 15.0
_SIGNATURE_VERSION = "1"
_DATA_TYPE = "audio"


async def get_right_policy(youtube_url: str) -> Optional[str]:
    """
    Returns one of: 'Allow', 'Monetize', 'ReportUsage', 'BlockAccess', or None.
    None means: not configured, not found, or API error.
    """
    if not settings.acrcloud_configured:
        return None

    timestamp = str(int(time.time()))
    endpoint = "/v1/identify"

    string_to_sign = "\n".join([
        "POST",
        endpoint,
        settings.acrcloud_access_key,
        _DATA_TYPE,
        _SIGNATURE_VERSION,
        timestamp,
    ])

    signature = base64.b64encode(
        hmac.new(
            settings.acrcloud_access_secret.encode("utf-8"),
            string_to_sign.encode("utf-8"),
            hashlib.sha1,
        ).digest()
    ).decode("utf-8")

    url = f"https://{settings.acrcloud_host}{endpoint}"

    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
            resp = await client.post(
                url,
                data={
                    "url": youtube_url,
                    "access_key": settings.acrcloud_access_key,
                    "data_type": _DATA_TYPE,
                    "signature_version": _SIGNATURE_VERSION,
                    "signature": signature,
                    "timestamp": timestamp,
                },
            )
            resp.raise_for_status()

        data = resp.json()
        music_items = (
            data.get("metadata", {}).get("music", [])
        )
        if music_items:
            return music_items[0].get("right_policy")
    except Exception:
        return None

    return None
