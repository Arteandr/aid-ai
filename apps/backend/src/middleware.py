from fastapi import Request
from sqlalchemy.orm import Session
from src.database.core import SessionLocal  
from starlette.middleware.base import BaseHTTPMiddleware

class DBSessionMiddleware(BaseHTTPMiddleware):
    def dispatch(self, request: Request, call_next):
        with SessionLocal() as session:
            request.state.db = session
            response = call_next(request) 
        return response
