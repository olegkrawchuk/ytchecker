import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from backend.classifier import classify_risk


def test_allow_policy_is_green():
    r = classify_risk("Allow", "Some Label", False)
    assert r["status"] == "GREEN"
    assert r["confidence"] == "HIGH"


def test_block_access_is_red():
    r = classify_risk("BlockAccess", "Some Label", False)
    assert r["status"] == "RED"
    assert r["confidence"] == "HIGH"


def test_monetize_is_yellow():
    r = classify_risk("Monetize", "Some Label", False)
    assert r["status"] == "YELLOW"
    assert r["confidence"] == "HIGH"


def test_report_usage_is_yellow():
    r = classify_risk("ReportUsage", "Any Label", False)
    assert r["status"] == "YELLOW"
    assert r["confidence"] == "HIGH"


def test_big_label_no_policy_is_red():
    r = classify_risk(None, "Universal Music Group", False)
    assert r["status"] == "RED"
    assert r["confidence"] == "MEDIUM"
    assert r["signals"]["big_label"] is True


def test_sony_label_is_red():
    r = classify_risk(None, "Sony Music Entertainment", None)
    assert r["status"] == "RED"


def test_region_restricted_no_policy_is_yellow():
    r = classify_risk(None, "", True)
    assert r["status"] == "YELLOW"
    assert r["confidence"] == "MEDIUM"


def test_unknown_label_no_policy_is_yellow():
    r = classify_risk(None, "Indie Records LLC", False)
    assert r["status"] == "YELLOW"
    assert r["confidence"] == "LOW"


def test_unrecognized_track_is_green():
    r = classify_risk(None, "", False)
    assert r["status"] == "GREEN"
    assert r["confidence"] == "LOW"


def test_unrecognized_track_none_label_is_green():
    r = classify_risk(None, None, None)
    assert r["status"] == "GREEN"


def test_creative_common_overrides_everything():
    r = classify_risk("BlockAccess", "Universal Music", True, license_type="creativeCommon")
    assert r["status"] == "GREEN"
    assert r["confidence"] == "HIGH"


def test_signals_included():
    r = classify_risk("Monetize", "WMG", False)
    assert "right_policy" in r["signals"]
    assert r["signals"]["right_policy"] == "Monetize"


def test_verdicts_are_strings():
    for policy in ("Allow", "BlockAccess", "Monetize", "ReportUsage"):
        r = classify_risk(policy, "", False)
        assert isinstance(r["live_verdict"], str)
        assert isinstance(r["vod_verdict"], str)
        assert len(r["live_verdict"]) > 10
