from sqlalchemy.orm import joinedload

import src.chats.service as chats_service
from src.database.core import DbSession
from src.exceptions import NotFoundError

from .models import Message


def create(db: DbSession, text: str, chat_id: int, send_by_id: int) -> Message:
    chat = chats_service.get_one_by_id(db, chat_id)
    if not chat:
        raise NotFoundError(message="Чат не найден")

    # Создаем сообщение
    message = Message(text=text, sended_by=send_by_id, chat_id=chat_id)
    db.add(message)
    db.commit()
    # Обновляем объект, чтобы получить присвоенный ID и другие поля от базы
    db.refresh(message)

    # Выполняем запрос с подгрузкой отношения sender
    message = (
        db.query(Message)
        .options(joinedload(Message.sender))
        .filter(Message.id == message.id)
        .one()
    )
    return message
