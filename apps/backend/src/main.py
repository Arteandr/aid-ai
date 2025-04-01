from fastapi import FastAPI
from src.api import api_router
from src.middleware import DBSessionMiddleware

app = FastAPI(title="AidAI",)

app.include_router(api_router)

app.add_middleware(DBSessionMiddleware)