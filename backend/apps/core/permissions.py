# backend/apps/core/permissions.py
from rest_framework.permissions import BasePermission


def user_has_role_permission(user, permission_code):
    if not user or not getattr(user, "is_authenticated", False):
        return False
    if not getattr(user, "is_active", False):
        return False
    if getattr(user, "is_superuser", False):
        return True

    role = getattr(user, "role", None)
    if not role:
        return False

    return role.has_permission(permission_code)


class IsAuthenticatedAndActive(BasePermission):
    message = "Authentication is required."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_active
        )


class HasRolePermissions(BasePermission):
    message = "You do not have permission to perform this action."

    def has_permission(self, request, view):
        if not (
            request.user
            and request.user.is_authenticated
            and request.user.is_active
        ):
            return False

        required_permissions = getattr(view, "required_permissions_by_method", {}).get(
            request.method,
            [],
        )
        return all(
            user_has_role_permission(request.user, permission_code)
            for permission_code in required_permissions
        )
