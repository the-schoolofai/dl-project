from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_prefix="APP_",
        extra="ignore",
    )

    project_name: str = "DL Image Classifier"
    version: str = "0.1.0"
    api_prefix: str = "/api/v1"

    cors_origins: list[str] = Field(default_factory=lambda: ["*"])

    model_path: Path = BACKEND_DIR / "artifacts" / "rps_cnn.keras"
    image_size: tuple[int, int] = (150, 150)
    class_names: list[str] = Field(
        default_factory=lambda: ["paper", "rock", "scissors"]
    )

    max_upload_bytes: int = 8 * 1024 * 1024
    allowed_content_types: set[str] = Field(
        default_factory=lambda: {
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "image/bmp",
        }
    )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
