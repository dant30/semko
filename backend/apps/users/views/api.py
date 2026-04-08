# backend/apps/users/views/api.py
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ImproperlyConfigured
from django.db.models import Q, Prefetch
import logging

from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from datetime import timedelta

from apps.audit.models import AuditLog
from apps.core.constants import RolePermissionCodes
from apps.core.permissions import HasRolePermissions, IsAuthenticatedAndActive
from apps.users.permissions import AllowPublicRegistration
from apps.users.serializers import (
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    RoleSerializer,
    UserCreateSerializer,
    UserReadSerializer,
    UserRegistrationSerializer,
    UserSelfUpdateSerializer,
    UserUpdateSerializer,
)
from apps.users.models import Role, TokenBlacklist
from apps.users.utils import rate_limit_by_ip
from apps.users.tasks import send_password_reset_email


User = get_user_model()
logger = logging.getLogger(__name__)


class RegisterAPIView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny, AllowPublicRegistration]

    @rate_limit_by_ip(attempts=5, window_seconds=3600, endpoint='register')
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class MeAPIView(APIView):
    permission_classes = [IsAuthenticatedAndActive]

    def get(self, request):
        serializer = UserReadSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserSelfUpdateSerializer(
            request.user,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserReadSerializer(request.user).data)


class ChangePasswordAPIView(APIView):
    permission_classes = [IsAuthenticatedAndActive]

    def patch(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        user = request.user
        user.set_password(serializer.validated_data["new_password"])
        user.must_change_password = False
        user.save(update_fields=["password", "must_change_password", "updated_at"])

        # Blacklist current token to force re-authentication
        try:
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ', 1)[1]
                try:
                    access_token = AccessToken(token)
                    expires_at = timezone.datetime.fromtimestamp(access_token['exp'], tz=timezone.utc)
                    TokenBlacklist.blacklist_token(
                        token,
                        user,
                        token_type="access",
                        expires_at=expires_at,
                        reason="password_change",
                    )
                except Exception:
                    logger.warning("Failed to blacklist access token after password change.")
        except Exception:
            logger.warning("Could not parse Authorization header for password change token blacklist.")

        AuditLog.objects.create(
            actor=user,
            action=AuditLog.Action.UPDATE,
            method=request.method,
            path=request.path,
            status_code=200,
            metadata={"event": "password_change"},
        )

        return Response(
            {"detail": "Password changed successfully. Please login again."},
            status=status.HTTP_200_OK,
        )


class LogoutAPIView(APIView):
    """
    Logout endpoint that blacklists both access and refresh tokens.
    """

    permission_classes = [IsAuthenticatedAndActive]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            access_token_str = None

            # Extract access token from Authorization header
            auth_header = request.META.get("HTTP_AUTHORIZATION", "")
            if auth_header.startswith("Bearer "):
                access_token_str = auth_header.split(" ", 1)[1]

            # Blacklist access token
            if access_token_str:
                try:
                    access_token = AccessToken(access_token_str)
                    expires_at = timezone.datetime.fromtimestamp(
                        access_token["exp"], tz=timezone.utc
                    )
                    TokenBlacklist.blacklist_token(
                        access_token_str,
                        request.user,
                        token_type="access",
                        expires_at=expires_at,
                        reason="logout",
                    )
                except Exception:
                    logger.warning("Failed to blacklist access token during logout.")

            # Blacklist refresh token
            if refresh_token:
                try:
                    refresh = RefreshToken(refresh_token)
                    expires_at = timezone.datetime.fromtimestamp(
                        refresh["exp"], tz=timezone.utc
                    )
                    TokenBlacklist.blacklist_token(
                        refresh_token,
                        request.user,
                        token_type="refresh",
                        expires_at=expires_at,
                        reason="logout",
                    )
                except Exception:
                    logger.warning("Failed to blacklist refresh token during logout.")

            AuditLog.objects.create(
                actor=request.user,
                action=AuditLog.Action.UPDATE,
                method=request.method,
                path=request.path,
                status_code=200,
                metadata={"event": "logout"},
            )

            return Response(
                {"detail": "Successfully logged out."},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            return Response(
                {"detail": f"Logout failed: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class ForgotPasswordAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    @rate_limit_by_ip(attempts=5, window_seconds=3600, endpoint='password_forgot')
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Validate FRONTEND_BASE_URL is configured in production
        frontend_base_url = getattr(settings, 'FRONTEND_BASE_URL', None)
        if not settings.DEBUG and not frontend_base_url:
            raise ImproperlyConfigured(
                "FRONTEND_BASE_URL must be set in production for password reset emails."
            )

        email = serializer.validated_data["email"]
        users = User.objects.filter(email__iexact=email, is_active=True)

        if users.exists():
            user = users.first()
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            base_url = frontend_base_url or 'http://localhost:3000'
            reset_link = f"{base_url.rstrip('/')}/reset-password?uid={uid}&token={token}"

            # Send password reset email asynchronously via Celery
            send_password_reset_email.delay(user.id, user.email, reset_link)

        return Response(
            {"detail": "If an active account with that email exists, a password reset email has been sent."},
            status=status.HTTP_200_OK,
        )


class ResetPasswordAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    @rate_limit_by_ip(attempts=5, window_seconds=3600, endpoint='password_reset')
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            uid = force_str(urlsafe_base64_decode(serializer.validated_data["uid"]))
            user = User.objects.get(pk=uid, is_active=True)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise ValidationError({"uid": "Invalid uid."})

        if not default_token_generator.check_token(user, serializer.validated_data["token"]):
            raise ValidationError({"token": "Invalid or expired token."})

        user.set_password(serializer.validated_data["new_password"])
        user.must_change_password = False
        user.save(update_fields=["password", "must_change_password", "updated_at"])

        # Blacklist all existing tokens for security
        # (password reset implies compromise or account recovery)
        TokenBlacklist.objects.filter(user=user, expires_at__gt=timezone.now()).delete()

        AuditLog.objects.create(
            actor=user,
            action=AuditLog.Action.UPDATE,
            method=request.method,
            path=request.path,
            status_code=200,
            metadata={"event": "password_reset"},
        )

        return Response({"detail": "Password has been reset. Please login again."}, status=status.HTTP_200_OK)


class UserListCreateAPIView(generics.ListCreateAPIView):
    queryset = User.objects.select_related("role").order_by("username")
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_USERS],
        "POST": [RolePermissionCodes.MANAGE_USERS],
    }

    def get_serializer_class(self):
        if self.request.method == "POST":
            return UserCreateSerializer
        return UserReadSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get("search")
        active_only = self.request.query_params.get("active_only")

        if search:
            queryset = queryset.filter(
                Q(username__icontains=search)
                | Q(email__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(phone_number__icontains=search)
            )

        if active_only in ["1", "true", "True", "yes"]:
            queryset = queryset.filter(is_active=True)

        return queryset


class UserDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.select_related("role").prefetch_related(
        "user_permissions__content_type",
        "groups__permissions__content_type",
    )
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_USERS],
        "PUT": [RolePermissionCodes.MANAGE_USERS],
        "PATCH": [RolePermissionCodes.MANAGE_USERS],
        "DELETE": [RolePermissionCodes.MANAGE_USERS],
    }

    def get_serializer_class(self):
        if self.request.method in {"PUT", "PATCH"}:
            return UserUpdateSerializer
        return UserReadSerializer

    def perform_destroy(self, instance):
        if self.request.user.pk == instance.pk:
            raise PermissionDenied("You cannot deactivate your own account.")
        if instance.is_superuser:
            raise PermissionDenied("Superuser accounts cannot be deactivated through this endpoint.")

        instance.is_active = False
        instance.save(update_fields=["is_active", "updated_at"])

        AuditLog.objects.create(
            actor=self.request.user,
            action=AuditLog.Action.DELETE,
            method=self.request.method,
            path=self.request.path,
            status_code=200,
            metadata={"target_user_id": instance.pk},
        )

    def perform_update(self, serializer):
        instance = serializer.save()
        AuditLog.objects.create(
            actor=self.request.user,
            action=AuditLog.Action.UPDATE,
            method=self.request.method,
            path=self.request.path,
            status_code=200,
            metadata={"target_user_id": instance.pk},
        )

    def delete(self, request, *args, **kwargs):
        self.destroy(request, *args, **kwargs)
        return Response(status=status.HTTP_204_NO_CONTENT)


class RoleListCreateAPIView(generics.ListCreateAPIView):
    queryset = Role.objects.order_by("name")
    serializer_class = RoleSerializer
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_ROLES],
        "POST": [RolePermissionCodes.MANAGE_ROLES],
    }


class RoleDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Role.objects.order_by("name")
    serializer_class = RoleSerializer
    permission_classes = [HasRolePermissions]
    required_permissions_by_method = {
        "GET": [RolePermissionCodes.VIEW_ROLES],
        "PUT": [RolePermissionCodes.MANAGE_ROLES],
        "PATCH": [RolePermissionCodes.MANAGE_ROLES],
        "DELETE": [RolePermissionCodes.MANAGE_ROLES],
    }

    def perform_destroy(self, instance):
        if instance.is_system:
            raise PermissionDenied("System roles cannot be deleted.")
        if instance.users.exists():
            raise PermissionDenied(
                "Cannot delete a role that is assigned to users."
            )
        instance.delete()


class LoginAPIView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]

    @rate_limit_by_ip(attempts=5, window_seconds=900, endpoint='login')
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)
