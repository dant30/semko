from .base import *

# Production environment hardening
DEBUG = False
ALLOWED_HOSTS = os.environ.get('DJANGO_ALLOWED_HOSTS', 'www.semko.co.ke,semko.co.ke').split(',')

# Render injects the active hostname in RENDER_EXTERNAL_HOSTNAME; allow it for health checks
RENDER_HOSTNAME = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
if RENDER_HOSTNAME and RENDER_HOSTNAME not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(RENDER_HOSTNAME)

# Also accept explicit legacy ALLOWED_HOSTS env var from UI (for compatibility)
LEGACY_HOSTS = os.environ.get('ALLOWED_HOSTS')
if LEGACY_HOSTS:
    for host in [h.strip() for h in LEGACY_HOSTS.split(',') if h.strip()]:
        if host not in ALLOWED_HOSTS:
            ALLOWED_HOSTS.append(host)

# ============================================================================
# Security: HTTPS & Cookies
# ============================================================================
# Enforce HTTPS for all requests in production
SECURE_SSL_REDIRECT = True

# Secure session and CSRF cookies (only sent over HTTPS)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Enforce secure HTTP headers
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Additional security headers
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'
SECURE_CONTENT_SECURITY_POLICY = {
    'default-src': ("'self'",),
    'script-src': ("'self'", "'unsafe-inline'"),  # Adjust based on your needs
    'style-src': ("'self'", "'unsafe-inline'"),
    'img-src': ("'self'", 'data:', 'https:'),
    'font-src': ("'self'", 'data:', 'https:'),
    'connect-src': ("'self'", "https://www.semko.co.ke", "https://semko.co.ke"),
}

# ============================================================================
# CORS: Production-safe configuration
# ============================================================================
# Allow only frontend origin(s) in production
CORS_ALLOWED_ORIGINS = os.environ.get(
    'CORS_ALLOWED_ORIGINS',
    'https://www.semko.co.ke,https://semko.co.ke'
).split(',')

FRONTEND_URL = os.environ.get('FRONTEND_URL') or os.environ.get('VITE_API_URL')
if FRONTEND_URL and FRONTEND_URL not in CORS_ALLOWED_ORIGINS:
    CORS_ALLOWED_ORIGINS.append(FRONTEND_URL)

CORS_ALLOW_CREDENTIALS = True

# Restrict CORS methods and headers
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# ============================================================================
# Database: Connection pooling for high availability
# ============================================================================
DATABASES['default']['CONN_MAX_AGE'] = 600  # 10 minutes per connection

# ============================================================================
# Secrets & Keys
# ============================================================================
# Enforce SECRET_KEY from environment; no hardcoded fallback
DJANGO_SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY') or os.environ.get('SECRET_KEY')
if not DJANGO_SECRET_KEY:
    raise ValueError(
        "DJANGO_SECRET_KEY or SECRET_KEY environment variable must be set in production. "
        "Generate with: python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'"
    )

SECRET_KEY = DJANGO_SECRET_KEY
