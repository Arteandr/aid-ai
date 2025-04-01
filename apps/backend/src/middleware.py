from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

from src.database.core import SessionLocal


class DBSessionMiddleware(BaseHTTPMiddleware):
    def dispatch(self, request: Request, call_next):
        with SessionLocal() as session:
            request.state.db = session
            response = call_next(request)
        return response
