from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from src.database.core import DbSessionWs
from src.users.service import get_current_user_ws

from .manager import SocketManager
from .service import parse_message, process_message

ws_router = APIRouter()


@ws_router.websocket("/ws")
async def process_websocket(
    websocket: WebSocket,
    manager: SocketManager,
    db: DbSessionWs,
):
    current_user = await get_current_user_ws(websocket=websocket, db=db)
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            socket_message = parse_message(data)
            if not socket_message:
                continue

            await process_message(
                db=db,
                manager=manager,
                current_user=current_user,
                websocket=websocket,
                message=socket_message,
            )
    except WebSocketDisconnect:
        manager.disconnect(websocket)
