import jwt
from fastapi import APIRouter, HTTPException, Request, Response

import src.users.service as users_service
from src.config import get_config
from src.database.core import DbSession
from src.exceptions import UnauthorizedError

from .models import (
    UserLogin,
    UserLoginResponse,
    UserRefreshResponse,
    UserRegister,
    UserRegisterResponse,
)

config = get_config()

auth_router = APIRouter()


def set_refresh_token_cookie(response: Response, refresh_token: str):
    response.set_cookie(
        key="refresh_token", value=refresh_token, httponly=True, secure=True
    )


@auth_router.post("/sign-up", response_model=UserRegisterResponse)
def register_user(response: Response, db: DbSession, user_in: UserRegister):
    user = users_service.get_user_by_email(db, user_in.email)
    if user:
        raise HTTPException(
            status_code=400, detail="Пользователь с таким email уже существует"
        )

    user = users_service.create(
        db, email=user_in.email, hashed_password=user_in.password
    )

    set_refresh_token_cookie(response, user.refresh_token)
    return user


@auth_router.post("/sign-in", response_model=UserLoginResponse)
def login_user(response: Response, db: DbSession, user_in: UserLogin):
    user = users_service.get_user_by_email(db, user_in.email)
    if user and user.verify_password(user_in.password):
        set_refresh_token_cookie(response, user.refresh_token)
        return user

    raise UnauthorizedError("Неверный логин или пароль")


@auth_router.post("/refresh", response_model=UserRefreshResponse)
def refresh(request: Request, response: Response, db: DbSession):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise UnauthorizedError("Неверный токен")

    try:
        data = jwt.decode(
            refresh_token, config.jwt_refresh_secret, algorithms=[config.jwt_alghorithm]
        )
    except jwt.ExpiredSignatureError:
        raise UnauthorizedError("Неверный токен")
    except jwt.InvalidTokenError:
        raise UnauthorizedError("Неверный токен")

    user_email = data.get("email")
    if not user_email:
        raise UnauthorizedError("Неверный токен")

    user = users_service.get_user_by_email(db, user_email)
    if not user:
        raise UnauthorizedError("Неверный токен")

    set_refresh_token_cookie(response, user.refresh_token)
    return user
