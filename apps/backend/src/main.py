from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from src.api import api_router
from src.exceptions import AidException, ErrorResponse
from src.middleware import DBSessionMiddleware
from src.socket_manager.view import ws_router

app = FastAPI(
    title="AidAI",
)


@app.exception_handler(AidException)
def app_exception_handler(request: Request, exc: AidException):
    error_response = ErrorResponse(
        message=exc.message, code=exc.code, details=exc.details
    )
    return JSONResponse(status_code=exc.code, content=error_response.dict())


app.include_router(api_router)
app.include_router(ws_router)

app.add_middleware(DBSessionMiddleware)
