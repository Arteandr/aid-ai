from sqlalchemy import desc

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
