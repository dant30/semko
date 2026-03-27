"""
Custom JWT Authentication with Blacklist Support

This module provides JWT authentication that validates tokens against
a blacklist to prevent use of revoked tokens.
"""

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from apps.users.models import TokenBlacklist


class BlacklistAwareJWTAuthentication(JWTAuthentication):
    """
    JWT Authentication backend that checks if a token is blacklisted.
    
    Extends the default SimpleJWT authentication to reject tokens that
    have been added to the blacklist (e.g., after logout or password change).
    """

    def authenticate(self, request):
        result = super().authenticate(request)

        if result is None:
            return result

        user, validated_token = result

        # Extract the raw token from the Authorization header
        try:
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if not auth_header.startswith('Bearer '):
                return result
            
            raw_token = auth_header.split(' ', 1)[1]
            
            # Check if this token is blacklisted
            if TokenBlacklist.is_blacklisted(raw_token, user):
                raise InvalidToken("Token has been revoked.")
        except (IndexError, AttributeError):
            # If we can't extract the token, proceed with default behavior
            pass

        return result
