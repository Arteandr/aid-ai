from fastapi import APIRouter, HTTPException

import src.users.service as users_service
from src.database.core import DbSession

from .models import UserLogin, UserLoginResponse, UserRegister, UserRegisterResponse

auth_router = APIRouter()


@auth_router.post("/sign-up", response_model=UserRegisterResponse)
def register_user(db: DbSession, user_in: UserRegister):
    user = users_service.get_user_by_email(db, user_in.email)
    if user:
        raise HTTPException(
            status_code=400, detail="Пользователь с таким email уже существует"
        )

    user = users_service.create(
        db, email=user_in.email, hashed_password=user_in.password
    )
    return user


@auth_router.post("/sign-in", response_model=UserLoginResponse)
def login_user(db: DbSession, user_in: UserLogin):
    user = users_service.get_user_by_email(db, user_in.email)
    if user and user.verify_password(user_in.password):
        return user

    raise HTTPException(status_code=401, detail="Неверный пароль или email")
