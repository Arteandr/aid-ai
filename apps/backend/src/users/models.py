import enum
from datetime import datetime, timedelta

import bcrypt
import jwt
import pytz
from sqlalchemy import Column, Enum, Integer, LargeBinary, String
from sqlalchemy.orm import relationship

from src.config import get_config
from src.models import Base, TimeStampMixin

config = get_config()


class UserRole(enum.Enum):
    USER = "user"
    SUPPORT_AGENT = "support_agent"


class User(Base, TimeStampMixin):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True)
    password = Column(LargeBinary, nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.USER)

    chats = relationship("Chat", back_populates="creator", cascade="all, delete-orphan")

    def verify_password(self, password: str) -> bool:
        if not password or not self.password:
            raise ValueError("Пароль не может быть пустым")
        return bcrypt.checkpw(password.encode("utf-8"), self.password)

    def is_support_agent(self) -> bool:
        return self.role == UserRole.SUPPORT_AGENT

    @property
    def token(self):
        utc_zone = pytz.UTC
        now = datetime.now(utc_zone)
        exp = (now + timedelta(minutes=config.jwt_access_expire_minutes)).timestamp()
        data = {
            "exp": exp,
            "id": self.id,
            "email": self.email,
        }
        return jwt.encode(
            data, config.jwt_access_secret, algorithm=config.jwt_alghorithm
        )

    @property
    def refresh_token(self):
        utc_zone = pytz.UTC
        now = datetime.now(utc_zone)
        exp = (now + timedelta(minutes=config.jwt_refresh_expire_minutes)).timestamp()
        data = {
            "exp": exp,
            "id": self.id,
            "email": self.email,
        }
        return jwt.encode(
            data, config.jwt_refresh_secret, algorithm=config.jwt_alghorithm
        )
