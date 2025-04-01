from typing import Annotated
from fastapi import Depends, HTTPException, Request
import jwt
from src.config import get_config
from src.database.core import DbSession
from .models import User

from fastapi.security.utils import get_authorization_scheme_param

config = get_config()

def get_user_by_email(db: DbSession, email: str):
    return db.query(User).filter(User.email == email).one_or_none()

def create(db: DbSession, email: str, hashed_password: str):
    user = User(email=email,password=hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


InvalidCredentialException = HTTPException(
    status_code=401, detail=[{"msg": "Неверные данные для входа"}]
)

def get_current_user(req: Request) -> User:
    if not req.state.db:
        raise HTTPException(status_code=400, detail={'msg': "Ошибка подключения к базе данных"})

    authorization: str = req.headers.get('Authorization')
    scheme, param = get_authorization_scheme_param(authorization)
    if not authorization or scheme.lower() != 'bearer':
        return
    
    token = authorization.split()[1]

    try:
        data = jwt.decode(token, config.jwt_secret, config.jwt_alghorithm)
    except Exception as e:
        raise HTTPException(status_code=401, detail={'msg': "Неверный токен"}) from None

    user_email = data["email"]
    if not user_email:
        raise InvalidCredentialException
    
    user = get_user_by_email(req.state.db, user_email)

    return user

CurrentUser = Annotated[User, Depends(get_current_user)]