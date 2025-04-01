from typing import Optional

from pydantic import BaseModel


class ErrorResponse(BaseModel):
    message: str
    code: int
    details: Optional[dict] = None


class AidException(Exception):
    def __init__(self, message: str, code: int = 400, details: dict = None):
        self.message = message
        self.code = code
        self.details = details


class NotFoundError(AidException):
    def __init__(self, message, code=400, details=None):
        super().__init__(message, code=404, details=details)


class BadRequestError(AidException):
    def __init__(self, message, code=400, details=None):
        super().__init__(message, code=400, details=details)
