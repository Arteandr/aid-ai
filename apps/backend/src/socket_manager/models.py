import enum
from typing import Annotated, Literal, Optional, Union

from pydantic import BaseModel, Field

from src.messages.models import MessageBase


class RequestMessageCommand(enum.Enum):
    SEND_MESSAGE = "send_message"


class SendMessageData(BaseModel):
    command: Literal[RequestMessageCommand.SEND_MESSAGE.value] = (
        RequestMessageCommand.SEND_MESSAGE.value
    )
    text: str
    chat_id: Optional[int] = None


class RequestSocketMessage(BaseModel):
    data: Annotated[Union[SendMessageData], Field(discriminator="command")]


class ResponseMessageCommand(enum.Enum):
    NEW_MESSAGE = "new_message"


class NewMessageData(BaseModel):
    message: MessageBase
    chat_id: int


type ResponseSocketMessageData = NewMessageData


class ResponseSocketMessage(BaseModel):
    data: ResponseSocketMessageData
