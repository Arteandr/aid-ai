from typing import List

from pydantic import BaseModel
from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import Mapped, relationship

from src.messages.models import MessageBase
from src.models import Base, TimeStampMixin
from src.users.models import User


class Chat(Base, TimeStampMixin):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True, index=True)
    created_by = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    creator: Mapped[User] = relationship("User", back_populates="chats")

    messages = relationship(
        "Message", back_populates="chat", cascade="all, delete-orphan"
    )


class ChatHistoryResponse(BaseModel):
    messages: List[MessageBase] = None
