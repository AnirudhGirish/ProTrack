from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List, Union
import os


class Settings(BaseSettings):
    SECRET_KEY: str = "change-me-to-a-random-64-char-string"

    # Railway sets DATABASE_URL directly (without prefix).
    # Config also supports FOREST_EOFFICE_DATABASE_URL for local .env files.
    # connection.py resolves the final URL with Railway's bare name taking priority.
    DATABASE_URL: str = "sqlite:///./data/app.db"

    # CORS_ORIGINS is stored as a plain string in .env / Railway env vars.
    # Use the validator below to split it into a list.
    # Accepted formats:
    #   JSON array:  ["https://myapp.railway.app","http://localhost:5173"]
    #   CSV string:  https://myapp.railway.app,http://localhost:5173
    CORS_ORIGINS_STR: str = "http://localhost:5173"

    GEMINI_API_KEY: str = ""
    RATE_LIMIT_LOGIN: str = "5/minute"
    RATE_LIMIT_GLOBAL: str = "100/minute"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    LOG_LEVEL: str = "INFO"

    @property
    def CORS_ORIGINS(self) -> List[str]:
        v = self.CORS_ORIGINS_STR.strip()
        if v.startswith("["):
            import json
            return json.loads(v)
        return [origin.strip() for origin in v.split(",") if origin.strip()]

    class Config:
        # env_file is optional — if it doesn't exist (e.g., on Railway), pydantic-settings
        # falls back to environment variables transparently.
        env_file = os.path.join(os.path.dirname(__file__), ".env")
        env_file_encoding = "utf-8"
        env_prefix = "FOREST_EOFFICE_"
        case_sensitive = True
        # Allow extra fields so Railway's additional env vars don't cause validation errors
        extra = "ignore"


settings = Settings()
