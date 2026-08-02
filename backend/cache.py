"""Redis-optional async cache. Falls back to in-memory dict if redis_url is empty."""

import json
from typing import Optional


class Cache:
    def __init__(self, redis_url: str = "", ttl: int = 21600):
        self._ttl = ttl
        self._redis = None
        self._memory: dict = {}

        if redis_url:
            try:
                import redis.asyncio as aioredis
                self._redis = aioredis.from_url(redis_url, decode_responses=True)
            except ImportError:
                pass  # redis not installed, fall back to memory

    async def get(self, key: str) -> Optional[dict]:
        if self._redis:
            raw = await self._redis.get(key)
            return json.loads(raw) if raw else None
        return self._memory.get(key)

    async def set(self, key: str, value: dict) -> None:
        if self._redis:
            await self._redis.setex(key, self._ttl, json.dumps(value))
        else:
            self._memory[key] = value
