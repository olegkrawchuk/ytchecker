from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    audd_api_token: str = ""
    acrcloud_host: str = "identify-eu-west-1.acrcloud.com"
    acrcloud_access_key: str = ""
    acrcloud_access_secret: str = ""
    youtube_data_api_key: str = ""

    mock_mode: bool = False
    cache_ttl_seconds: int = 21600
    redis_url: str = ""

    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    @property
    def audd_configured(self) -> bool:
        return bool(self.audd_api_token)

    @property
    def acrcloud_configured(self) -> bool:
        return bool(self.acrcloud_access_key and self.acrcloud_access_secret)

    @property
    def youtube_configured(self) -> bool:
        return bool(self.youtube_data_api_key)


settings = Settings()
