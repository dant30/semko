"""
Rate limiting utilities for authentication endpoints.

Provides decorators and utilities to rate-limit authentication attempts,
password reset requests, and registration endpoints.
"""

from functools import wraps
from django.core.cache import cache
from django.utils.timezone import now
from rest_framework.response import Response
from rest_framework import status


def rate_limit_by_ip(
    attempts: int = 5,
    window_seconds: int = 3600,
    endpoint: str = "auth"
):
    """
    Rate limit an endpoint by IP address.
    
    Args:
        attempts: Maximum number of attempts allowed within the window
        window_seconds: Time window in seconds (default: 1 hour)
        endpoint: Name of the endpoint for cache key (should be unique per endpoint)
    
    Returns:
        Decorated function that enforces rate limiting
    
    Example:
        @rate_limit_by_ip(attempts=5, window_seconds=3600, endpoint='login')
        def post(self, request):
            ...
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(self, request, *args, **kwargs):
            # Get client IP address
            client_ip = get_client_ip(request)
            cache_key = f"rate_limit:{endpoint}:{client_ip}"
            
            # Get current attempt count
            attempt_count = cache.get(cache_key, 0)
            
            if attempt_count >= attempts:
                return Response(
                    {
                        "detail": f"Too many attempts. Please try again in {window_seconds // 60} minutes."
                    },
                    status=status.HTTP_429_TOO_MANY_REQUESTS,
                )
            
            # Increment attempt count
            cache.set(cache_key, attempt_count + 1, window_seconds)
            
            # Call the actual view
            response = view_func(self, request, *args, **kwargs)
            
            # Reset counter on successful response (2xx)
            if 200 <= response.status_code < 300:
                cache.delete(cache_key)
            
            return response
        
        return wrapper
    return decorator


def get_client_ip(request) -> str:
    """
    Extract client IP address from request, accounting for proxies.
    
    Checks X-Forwarded-For header first (for proxied requests),
    then falls back to REMOTE_ADDR.
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR', '127.0.0.1')
    return ip


def clear_rate_limits_for_user(user, endpoints: list = None):
    """
    Clear rate limit counters for a specific user after they complete auth.
    
    Args:
        user: Django user instance
        endpoints: List of endpoint names to clear (if None, clears all)
    """
    if endpoints is None:
        endpoints = ['login', 'register', 'password_reset', 'password_forgot']
    
    # This is typically called by IP, but we keep it for potential future use
    # where we might allow clearing after email confirmation, etc.
    pass
