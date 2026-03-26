from rest_framework.permissions import BasePermission

from apps.core.utils.permissions import user_has_role_permission


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
