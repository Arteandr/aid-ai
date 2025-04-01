import logging
from typing import Annotated

from fastapi import Depends, HTTPException, Request
from fastapi.security.utils import get_authorization_scheme_param
import jwt

from src.config import get_config
from src.database.core import DbSession
from src.users.models import User
import src.users.service as users_service

log = logging.getLogger(__name__)

config = get_config()

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
        log.error(e)
        raise HTTPException(status_code=401, detail={'msg': "Неверный токен"}) from None

    user_email = data["email"]
    if not user_email:
        raise InvalidCredentialException
    
    user = users_service.get_user_by_email(req.state.db, user_email)

    return user

CurrentUser = Annotated[User, Depends(get_current_user)]