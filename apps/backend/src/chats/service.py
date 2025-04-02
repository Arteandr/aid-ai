from typing import Optional

from sqlalchemy import desc

import src.messages.service as message_service
from src.database.core import DbSession
from src.messages.models import Message

from .models import Chat


def get_one_by_id(db: DbSession, id: int) -> Chat | None:
    return db.query(Chat).filter(Chat.id == id).one_or_none()


def create(db: DbSession, created_by_id: int) -> Chat:
    chat = Chat(created_by=created_by_id)
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return chat


def history(db: DbSession, chat_id: int) -> list[Message]:
    return (
        db.query(Message)
        .filter(Message.chat_id == chat_id)
        .order_by(desc(Message.created_at))
        .all()
    )


def process_discussion(
    db: DbSession, current_user_id: int, chat_id: Optional[int], text: str
) -> Message:
    if not chat_id:
        chat = create(db, current_user_id)
    else:
        chat = get_one_by_id(db, chat_id)

    message = message_service.create(db, text, chat.id, current_user_id)

    return message
