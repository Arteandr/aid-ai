from fastapi import APIRouter, Depends, HTTPException

from src.auth.permissions import PermissionsDependency, UserPermission
from src.auth.service import CurrentUser
from src.database.core import DbSession
import src.users.service as users_service
from .models import (UserLoginResponse, UserRead, UserRegister, UserLogin, UserRegisterResponse)

auth_router = APIRouter()

@auth_router.post("/sign-up", response_model=UserRegisterResponse)
def register_user(
    db: DbSession,
    user_in: UserRegister
):
    user = users_service.get_user_by_email(db, user_in.email)
    if user:
        raise HTTPException(status_code=400, detail="Пользователь с таким email уже существует")
    
    user = users_service.create(db, email=user_in.email, hashed_password=user_in.password)
    return user

@auth_router.post("/sign-in", response_model=UserLoginResponse)
def login_user(db: DbSession,
                     user_in: UserLogin):
    user = users_service.get_user_by_email(db, user_in.email)
    if user and user.verify_password(user_in.password):
        return {"token": user.token}
    
    raise HTTPException(status_code=401, detail="Неверный пароль или email")


@auth_router.get("/me", dependencies=[
    Depends(
        PermissionsDependency(
            [
                UserPermission
            ]
        )
    )
], response_model=UserRead)
def get_me(current_user: CurrentUser):
    return current_user

    