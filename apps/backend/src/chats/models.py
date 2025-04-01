from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import relationship

from src.models import Base, TimeStampMixin


class Chat(Base, TimeStampMixin):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True, index=True)
    created_by = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    creator = relationship("User", back_populates="chats")

    messages = relationship(
        "Message", back_populates="chat", cascade="all, delete-orphan"
    )
