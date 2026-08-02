"""Integration tests against FastAPI TestClient with MOCK_MODE=true."""

import os
os.environ["MOCK_MODE"] = "true"
os.environ["AUDD_API_TOKEN"] = "fake-token"

import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

VIDEO_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"


def test_health_returns_ok():
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert "apis_configured" in data


def test_mock_examples_returns_three():
    resp = client.get("/api/mock-examples")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 3
    statuses = {r["status"] for r in data}
    assert statuses == {"GREEN", "YELLOW", "RED"}


def test_check_returns_valid_structure():
    resp = client.post("/api/check", json={"url": VIDEO_URL, "mock": True})
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] in ("GREEN", "YELLOW", "RED")
    assert data["confidence"] in ("HIGH", "MEDIUM", "LOW")
    assert isinstance(data["live_verdict"], str)
    assert isinstance(data["vod_verdict"], str)
    assert "track" in data
    assert "signals" in data
    assert "checked_at" in data
    assert "disclaimer" in data


def test_check_invalid_url_returns_400():
    resp = client.post("/api/check", json={"url": "https://example.com/not-youtube"})
    assert resp.status_code == 400


def test_check_with_region():
    resp = client.post("/api/check", json={"url": VIDEO_URL, "mock": True, "region": "UA"})
    assert resp.status_code == 200


def test_mock_examples_have_verdicts():
    resp = client.get("/api/mock-examples")
    for item in resp.json():
        assert len(item["live_verdict"]) > 5
        assert len(item["vod_verdict"]) > 5
        assert item["track"]["recognized"] is True
