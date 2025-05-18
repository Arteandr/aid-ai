from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

from src.database.core import SessionLocal


class DBSessionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        with SessionLocal() as session:
            request.state.db = session
            response = await call_next(request)
        return response
