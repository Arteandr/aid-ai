from typing import Annotated

import jwt
from fastapi import Depends, Request, WebSocket
from fastapi.security.utils import get_authorization_scheme_param

from src.config import get_config
from src.database.core import DbSession, DbSessionWs
from src.exceptions import InternalError, UnauthorizedError

from .models import User

config = get_config()


def get_user_by_email(db: DbSession, email: str) -> User | None:
    return db.query(User).filter(User.email == email).one_or_none()


def create(db: DbSession, email: str, hashed_password: str):
    user = User(email=email, password=hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


InvalidCredentialException = UnauthorizedError("Неверные данные для входа")


def get_current_user(req: Request) -> User:
    if not req.state.db:
        raise InternalError(message="Ошибка подключения к базе данных")

    authorization: str = req.headers.get("Authorization")
    scheme, param = get_authorization_scheme_param(authorization)
    if not authorization or scheme.lower() != "bearer":
        return

    token = authorization.split()[1]

    try:
        data = jwt.decode(token, config.jwt_access_secret, config.jwt_alghorithm)
    except Exception:
        raise UnauthorizedError(message="Неверный токен")

    user_email = data["email"]
    if not user_email:
        raise InvalidCredentialException

    user = get_user_by_email(req.state.db, user_email)

    return user

CurrentUser = Annotated[User, Depends(get_current_user)]


async def get_current_user_ws(db: DbSessionWs, websocket: WebSocket) -> User:
    # authorization: str = websocket.headers.get("Authorization")
    # scheme, param = get_authorization_scheme_param(authorization)

    # if not authorization or scheme.lower() != "bearer":
    #     await websocket.close(code=1008)
    #     raise UnauthorizedError(message="Неверный токен")

    token: str = websocket.query_params.get("token")

    if not token:
        await websocket.close(code=1008)
        raise UnauthorizedError(message="Token is missing in query params")

    try:
        data = jwt.decode(
            token, config.jwt_access_secret, algorithms=[config.jwt_alghorithm]
        )
    except Exception:
        await websocket.close(code=1008)
        raise UnauthorizedError(message="Неверный токен")

    user_email = data.get("email")
    if not user_email:
        await websocket.close(code=1008)
        raise InvalidCredentialException

    user = get_user_by_email(db, user_email)
    return user
