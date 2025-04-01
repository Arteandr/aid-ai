from fastapi import APIRouter
from fastapi.responses import JSONResponse

from src.auth.view import auth_router
from src.chats.view import chats_router
from src.messages.view import messages_router
from src.users.view import users_router

api_router = APIRouter(
    default_response_class=JSONResponse,
)

api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(users_router, prefix="/users", tags=["users"])
api_router.include_router(messages_router, prefix="/messages", tags=["messages"])
api_router.include_router(chats_router, prefix="/chats", tags=["chats"])
