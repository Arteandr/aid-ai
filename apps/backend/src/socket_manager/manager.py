from functools import lru_cache
from typing import Annotated

from fastapi import Depends, WebSocket

from src.database.core import SessionLocal
from src.socket_manager.models import (
    ResponseMessageCommand,
    ResponseSocketMessage,
    ResponseSocketMessageData,
)


class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        websocket.state.db = SessionLocal()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_json(self, data: dict, websocket: WebSocket):
        await websocket.send_json(data)

    async def send_message(
        self,
        command: ResponseMessageCommand,
        data: ResponseSocketMessageData,
        websocket: WebSocket,
    ):
        socket_message = ResponseSocketMessage(data=data, command=command)
        await websocket.send_text(socket_message.model_dump_json(by_alias=True))


@lru_cache()
def get_socket_manager():
    return ConnectionManager()


SocketManager = Annotated[ConnectionManager, Depends(get_socket_manager)]
