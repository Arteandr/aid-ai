from abc import ABC, abstractmethod

from fastapi import HTTPException, Request

from src.users.models import UserRole
import src.users.service as users_service


class BasePermission(ABC):
    user_error_msg = [{"msg": "Пользователь не найден."}]
    user_error_code = 404 

    user_role_error_msg = [{"msg": "Отказано в доступе."}]
    user_role_error_code = 403

    role: UserRole = None

    @abstractmethod
    def has_required_permissions(self, request: Request) -> bool: ...

    def __init__(self, request: Request):
        user = users_service.get_current_user(request)
        if not user:
            raise HTTPException(status_code=self.user_error_code, detail=self.user_error_msg)
        self.role = user.role
        if not self.has_required_permissions(request):
            raise HTTPException(
                status_code=self.user_role_error_code, detail=self.user_role_error_msg
            )

class UserPermission(BasePermission):
    def has_required_permissions(self, request) -> bool:
        return self.role == UserRole.USER

class SupportManagerPermission(BasePermission):
    def has_required_permissions(self, request) -> bool:
        return self.role == UserRole.SUPPORT_AGENT

class PermissionsDependency(object):
    def __init__(self, permissions_classes: list):
        self.permissions_classes = permissions_classes

    def __call__(self, request: Request):
        for permission_class in self.permissions_classes:
            permission_class(request=request)