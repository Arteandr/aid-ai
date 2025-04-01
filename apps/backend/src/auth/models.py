from typing import Optional
import bcrypt
from pydantic import BaseModel, EmailStr, Field, field_validator
from passlib.context import CryptContext

from src.models import PrimaryKey

def hash_password(password: str) -> bytes:
    pw = bytes(password, "utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pw, salt)

class UserBase(BaseModel):
    email: EmailStr

    @field_validator("email")
    @classmethod
    def validate_email(clas, v: str) -> str:
        if not v:
            raise ValueError("Email обязательно должен быть указан")
        return v

class UserLogin(UserBase):
    password: str

    @field_validator("password")
    @classmethod
    def password_required(cls, v: str) -> str:
        if not v:
            raise ValueError("Пароль обязательно должен быть указан")
        return v
    
class UserRegister(UserLogin):
    password: Optional[str] = Field(None, nullable=True)

    @field_validator("password")
    def password_required(cls, v: str) -> str:
        return hash_password(v)
    
class UserLoginResponse(BaseModel):
    token: Optional[str] = Field(None, nullable=True)

class UserRegisterResponse(UserLoginResponse):
    pass

class UserRead(UserBase):
    id: PrimaryKey
    role: Optional[str] = Field(None, nullable=True)