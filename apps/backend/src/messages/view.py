from fastapi import APIRouter

from src.database.core import DbSession
from src.users.service import CurrentUser

from .service import create

messages_router = APIRouter()


@messages_router.post("")
async def create_message(db: DbSession, current_user: CurrentUser):
    message = create(db, "test text", 1, current_user.id)
    return {"message_id": message.id}
