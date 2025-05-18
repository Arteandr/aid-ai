import enum
from typing import Annotated, Literal, Optional, Union

from pydantic import Field

from src.messages.models import MessageBase
from src.models import BaseSchema


class RequestMessageCommand(enum.Enum):
    SEND_MESSAGE = "send_message"


class SendMessageData(BaseSchema):
    command: Literal[RequestMessageCommand.SEND_MESSAGE.value] = (
        RequestMessageCommand.SEND_MESSAGE.value
    )
    text: str
    chat_id: Optional[int] = None


class RequestSocketMessage(BaseSchema):
    data: Annotated[Union[SendMessageData], Field(discriminator="command")]


class ResponseMessageCommand(enum.Enum):
    NEW_MESSAGE = "new_message"


class NewMessageData(BaseSchema):
    message: MessageBase
    chat_id: int


type ResponseSocketMessageData = NewMessageData


class ResponseSocketMessage(BaseSchema):
    command: ResponseMessageCommand
    data: ResponseSocketMessageData
