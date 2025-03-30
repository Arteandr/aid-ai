from pydantic_settings import BaseSettings


class ApplicationConfig(BaseSettings):
    port: int = 3000
    log_level: str = 'debug'