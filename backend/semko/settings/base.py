import os
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent.parent
SECRET_KEY = os.environ.get(
    'DJANGO_SECRET_KEY',
    'django-insecure-semko-dev-key-change-me-2026',
)
DEBUG = os.environ.get('DJANGO_DEBUG', 'True') == 'True'
ALLOWED_HOSTS = os.environ.get('DJANGO_ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')
ALLOW_PUBLIC_REGISTRATION = os.environ.get('ALLOW_PUBLIC_REGISTRATION', 'False') == 'True'
TRIP_DOCUMENT_MAX_UPLOAD_MB = int(os.environ.get('TRIP_DOCUMENT_MAX_UPLOAD_MB', '10'))
TRIP_DOCUMENT_ALLOWED_TYPES = [
    ext.strip().lower()
    for ext in os.environ.get(
        'TRIP_DOCUMENT_ALLOWED_TYPES',
        '.pdf,.jpg,.jpeg,.png,.txt',
    ).split(',')
    if ext.strip()
]
TRIP_DOCUMENTS_EXPOSE_DIRECT_URLS = (
    os.environ.get('TRIP_DOCUMENTS_EXPOSE_DIRECT_URLS', 'False') == 'True'
)

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'apps.core',
    'apps.users',
    'apps.vehicles',
    'apps.drivers',
    'apps.clients',
    'apps.materials',
    'apps.trips',
    'apps.cess',
    'apps.payroll',
    'apps.stores',
    'apps.fuel',
    'apps.maintenance',
    'apps.rules',
    'apps.audit',
    'apps.reports',
    'apps.notifications',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'apps.audit.middleware.AuditMiddleware',
]

ROOT_URLCONF = 'semko.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'semko.wsgi.application'

from urllib.parse import urlparse

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'semko'),
        'USER': os.environ.get('DB_USER', 'semko'),
        'PASSWORD': os.environ.get('DB_PASSWORD', 'semko'),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}

DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL:
    parsed = urlparse(DATABASE_URL)
    DATABASES['default'] = {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': parsed.path.lstrip('/'),
        'USER': parsed.username or os.environ.get('DB_USER', 'semko'),
        'PASSWORD': parsed.password or os.environ.get('DB_PASSWORD', 'semko'),
        'HOST': parsed.hostname or os.environ.get('DB_HOST', 'localhost'),
        'PORT': parsed.port or int(os.environ.get('DB_PORT', 5432)),
        'CONN_MAX_AGE': 600,
    }

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Africa/Nairobi'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'static'
MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL = 'users.User'

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'AUTH_HEADER_TYPES': ('Bearer',),
}

CELERY_BROKER_URL = 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'noreply@semko.local')
SMS_SENDER_ID = os.environ.get('SMS_SENDER_ID', 'SEMKO')
