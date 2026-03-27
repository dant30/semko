"""
Token Blacklist Model

Tracks revoked JWT tokens to prevent their reuse after logout or password change.
Tokens are automatically cleaned up after expiration via a management command.
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class TokenBlacklist(models.Model):
    """
    Stores blacklisted JWT tokens (access and refresh).
    
    When a user logs out or changes their password, their tokens are added here.
    Authentication backends check this table to reject revoked tokens.
    """

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="blacklisted_tokens",
        help_text="User who owns the blacklisted token",
    )
    token = models.TextField(
        db_index=True,
        help_text="The JWT token string (hashed or plaintext)",
    )
    token_type = models.CharField(
        max_length=10,
        choices=[("access", "Access Token"), ("refresh", "Refresh Token")],
        default="access",
        help_text="Type of token: access or refresh",
    )
    blacklisted_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when token was blacklisted",
    )
    expires_at = models.DateTimeField(
        help_text="Timestamp when token naturally expires (for cleanup)",
    )
    reason = models.CharField(
        max_length=255,
        choices=[
            ("logout", "User Logout"),
            ("password_change", "Password Changed"),
            ("admin_revoke", "Admin Revocation"),
            ("session_timeout", "Session Timeout"),
        ],
        default="logout",
        help_text="Reason for blacklisting",
    )

    class Meta:
        ordering = ["-blacklisted_at"]
        indexes = [
            models.Index(fields=["token", "user"]),
            models.Index(fields=["expires_at"]),
            models.Index(fields=["user", "token_type"]),
        ]

    def __str__(self) -> str:
        return f"Blacklist: {self.user.username} ({self.token_type}) - {self.reason}"

    @classmethod
    def is_blacklisted(cls, token: str, user=None) -> bool:
        """Check if a token is blacklisted."""
        query = cls.objects.filter(token=token)
        if user:
            query = query.filter(user=user)
        return query.exists()

    @classmethod
    def blacklist_token(
        cls,
        token: str,
        user,
        token_type: str = "access",
        expires_at=None,
        reason: str = "logout",
    ) -> "TokenBlacklist":
        """Add a token to the blacklist."""
        if expires_at is None:
            expires_at = timezone.now()
        return cls.objects.create(
            token=token,
            user=user,
            token_type=token_type,
            expires_at=expires_at,
            reason=reason,
        )

    @classmethod
    def cleanup_expired(cls):
        """Delete blacklist entries for tokens that have already expired."""
        now = timezone.now()
        deleted_count, _ = cls.objects.filter(expires_at__lt=now).delete()
        return deleted_count
