# backend/apps/users/permissions.py
from django.conf import settings
from rest_framework.permissions import BasePermission


class IsSelfOrSuperuser(BasePermission):
    def has_object_permission(self, request, view, obj):
        return bool(
            request.user
            and request.user.is_authenticated
            and (request.user.is_superuser or request.user.pk == obj.pk)
        )


class AllowPublicRegistration(BasePermission):
    message = "Public registration is disabled."

    def has_permission(self, request, view):
        return getattr(settings, "ALLOW_PUBLIC_REGISTRATION", False)
