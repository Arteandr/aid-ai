from fastapi import APIRouter, Depends

from src.auth.models import UserRead
from src.auth.permissions import PermissionsDependency, UserPermission
from .service import CurrentUser


users_router = APIRouter()

@users_router.get("/me", dependencies=[
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
