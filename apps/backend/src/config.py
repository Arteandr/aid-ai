from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class ApplicationConfig(BaseSettings):
    port: int = 3000
    log_level: str = "debug"
    jwt_secret: str = "123123"
    jwt_alghorithm: str = "HS256"
    jwt_expire_minutes: int = 30

    model_config = SettingsConfigDict(env_file=".env", extra="allow")


@lru_cache
def get_config():
    return ApplicationConfig()
