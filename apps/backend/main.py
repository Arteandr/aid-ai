import logging
import uvicorn
from functools import lru_cache
from fastapi import FastAPI

from .core.config import ApplicationConfig

@lru_cache
def get_config():
    return ApplicationConfig()

app = FastAPI(title="AidAI")

if __name__ == "__main__":
    config = get_config()
    uvicorn.run(app, port=config.port, log_level=config.log_level)
