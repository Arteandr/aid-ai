from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class ApplicationConfig(BaseSettings):
    port: int = 3000
    log_level: str = "debug"
    jwt_access_secret: str = "123123"
    jwt_refresh_secret: str = "123123"
    jwt_access_expire_minutes: int = 30
    jwt_refresh_expire_minutes: int = 360
    jwt_alghorithm: str = "HS256"

    model_config = SettingsConfigDict(env_file=".env", extra="allow")


@lru_cache
def get_config():
    return ApplicationConfig()
