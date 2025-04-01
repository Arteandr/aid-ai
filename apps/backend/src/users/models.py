import enum
from datetime import datetime, timedelta

import bcrypt
import jwt
import pytz
from sqlalchemy import Column, Enum, Integer, LargeBinary, String
from sqlalchemy.orm import relationship

from src.config import get_config
from src.models import Base, TimeStampMixin

utc_zone = pytz.UTC
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

    @property
    def token(self):
        now = datetime.now(utc_zone)
        print("Now is %s" % now)
        print("Calculated is %s" % (now + timedelta(minutes=config.jwt_expire_minutes)))
        exp = (now + timedelta(minutes=config.jwt_expire_minutes)).timestamp()
        data = {
            "exp": exp,
            "id": self.id,
            "email": self.email,
        }
        return jwt.encode(data, config.jwt_secret, algorithm=config.jwt_alghorithm)
