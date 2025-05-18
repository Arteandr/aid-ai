from datetime import datetime

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, relationship

from src.auth.models import UserBase
from src.models import Base, BaseSchema, TimeStampMixin
from src.users.models import User, UserRole


class Message(Base, TimeStampMixin):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String, nullable=False)
    sended_by = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    sender: Mapped[User] = relationship("User")

    chat_id = Column(
        Integer, ForeignKey("chats.id", ondelete="CASCADE"), nullable=False
    )
    chat = relationship("Chat", back_populates="messages")

    @property
    def sender_role(self) -> UserRole:
        return self.sender.role


class MessageBase(BaseSchema):
    id: int
    text: str
    sender_role: UserRole
    sender: UserBase
    sended_by: int
    created_at: datetime
