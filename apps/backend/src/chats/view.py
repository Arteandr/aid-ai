from typing import List

from fastapi import APIRouter

from src.chats.models import ChatHistoryResponse, ChatResponse
from src.database.core import DbSession
from src.exceptions import BadRequestError, NotFoundError
from src.users.service import CurrentUser

from .service import create, get_many, get_one_by_id, history

chats_router = APIRouter()


@chats_router.post("")
def create_chat(db: DbSession, current_user: CurrentUser):
    chat = create(db, current_user.id)

    return chat


@chats_router.get("", response_model=List[ChatResponse])
def get_chat_list(db: DbSession, current_user: CurrentUser):
    chats = get_many(db, currentUser=current_user)
    print("CHAT ", chats[0].__dict__)
    return chats


@chats_router.get("/{chat_id}/history", response_model=ChatHistoryResponse)
def get_chat_history(db: DbSession, current_user: CurrentUser, chat_id: int):
    chat = get_one_by_id(db, chat_id)
    if not chat:
        raise NotFoundError("Чат не найден")

    if not current_user.is_support_agent() and chat.creator.id != current_user.id:
        raise BadRequestError("Вы не можете просматривать историю чата")

    messages = history(db, chat.id)
    return {"messages": messages}
