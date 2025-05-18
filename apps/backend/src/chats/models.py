import enum
from datetime import datetime
from typing import List

from sqlalchemy import Column, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, relationship

from src.messages.models import MessageBase
from src.models import Base, BaseSchema, TimeStampMixin
from src.users.models import User


class ChatStatus(enum.Enum):
    OPEN = "open"
    CLOSED = "closed"


class Chat(Base, TimeStampMixin):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    status = Column(Enum(ChatStatus), nullable=False, default=ChatStatus.OPEN)
    created_by = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    creator: Mapped[User] = relationship("User", back_populates="chats")

    messages = relationship(
        "Message", back_populates="chat", cascade="all, delete-orphan"
    )


class ChatResponse(BaseSchema):
    id: int
    name: str
    status: str
    messages: List[MessageBase]
    created_at: datetime
    updated_at: datetime


class ChatHistoryResponse(BaseSchema):
    messages: List[MessageBase] = None
