import logging

from fastapi import WebSocket
from pydantic import ValidationError

import src.chats.service as chats_service
from src.database.core import DbSessionWs
from src.messages.models import MessageBase
from src.socket_manager.manager import SocketManager
from src.users.service import CurrentUser

from .models import (
    NewMessageData,
    RequestMessageCommand,
    RequestSocketMessage,
    SendMessageData,
)

logger = logging.getLogger(__name__)


def parse_message(data: str) -> RequestSocketMessage | None:
    try:
        return RequestSocketMessage.model_validate_json(data)
    except ValidationError as e:
        logger.error("Cannot validate socket message %s: %s", data, e)
        return None


async def process_message(
    *,
    db: DbSessionWs,
    manager: SocketManager,
    current_user: CurrentUser,
    websocket: WebSocket,
    message: RequestSocketMessage,
):
    if message.data.command == RequestMessageCommand.SEND_MESSAGE.value:
        await on_send_message(
            db=db,
            manager=manager,
            current_user=current_user,
            websocket=websocket,
            data=message.data,
        )


async def on_send_message(
    db: DbSessionWs,
    manager: SocketManager,
    current_user: CurrentUser,
    websocket: WebSocket,
    data: SendMessageData,
):
    new_message = chats_service.process_discussion(
        db, current_user.id, data.chat_id, data.text
    )
    response_data = NewMessageData(
        message=MessageBase.model_validate(new_message), chat_id=new_message.chat_id
    )
    await manager.send_message(data=response_data, websocket=websocket)
