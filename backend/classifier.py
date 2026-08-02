from typing import Optional

BIG_LABELS = [
    "Universal Music",
    "Sony Music",
    "Warner Music",
    "Republic Records",
    "Atlantic Records",
    "Island Records",
    "Interscope",
    "Columbia Records",
    "Capitol Records",
    "Def Jam",
    "RCA Records",
    "Epic Records",
]

_VERDICTS = {
    "GREEN": {
        "live_verdict": "Можна вмикати — трек дозволений або не знайдений в базах Content ID.",
        "vod_verdict": "Запис збережеться без обмежень.",
    },
    "YELLOW": {
        "live_verdict": (
            "Стрім скоріш за все не перервуть, але є ризик попередження від YouTube. "
            "Якщо прийде попередження — прибери трек, щоб уникнути паузи стріму."
        ),
        "vod_verdict": (
            "Запис після стріму можуть заблокувати або забрати монетизацію "
            "на користь правовласника."
        ),
    },
    "RED": {
        "live_verdict": (
            "Прийде попередження від YouTube. Якщо не прибереш трек — "
            "стрім тимчасово перерветься (заглушення + placeholder). "
            "Продовжені порушення призведуть до примусового завершення стріму."
        ),
        "vod_verdict": "Запис буде заблоковано після завершення стріму.",
    },
}


def classify_risk(
    right_policy: Optional[str],
    label: Optional[str],
    region_restricted: Optional[bool],
    license_type: Optional[str] = None,
) -> dict:
    """
    Returns dict with: status, live_verdict, vod_verdict, confidence, signals.
    Pure function — no I/O.
    """
    label = label or ""
    signals = {
        "right_policy": right_policy,
        "license_type": license_type,
        "big_label": False,
        "region_restricted": region_restricted,
    }

    if license_type == "creativeCommon":
        return _result("GREEN", "HIGH", signals)

    if right_policy == "Allow":
        return _result("GREEN", "HIGH", signals)

    if right_policy == "BlockAccess":
        return _result("RED", "HIGH", signals)

    if right_policy in ("Monetize", "ReportUsage"):
        return _result("YELLOW", "HIGH", signals)

    is_big_label = any(lbl.lower() in label.lower() for lbl in BIG_LABELS)
    signals["big_label"] = is_big_label

    if is_big_label:
        return _result("RED", "MEDIUM", signals)

    if region_restricted:
        return _result("YELLOW", "MEDIUM", signals)

    if label:
        return _result("YELLOW", "LOW", signals)

    # Track not recognized — likely no Content ID
    return _result("GREEN", "LOW", signals)


def _result(status: str, confidence: str, signals: dict) -> dict:
    return {
        "status": status,
        "confidence": confidence,
        "signals": signals,
        **_VERDICTS[status],
    }
