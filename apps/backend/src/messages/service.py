import src.chats.service as chats_service
from src.database.core import DbSession
from src.exceptions import NotFoundError
from src.messages.models import Message


def create(db: DbSession, text: str, chat_id: int, sended_by_id: int) -> Message:
    chat = chats_service.get_one_by_id(db, chat_id)
    if not chat:
        raise NotFoundError(message="Чат не найден")

    message = Message(text=text, sended_by=sended_by_id, chat_id=chat_id)
    db.add(message)
    db.commit()

    return message
