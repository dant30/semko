<#
.SYNOPSIS
    Creates the SEMKO project backend directory structure as specified in the design document.
.DESCRIPTION
    This script generates the complete folder and file hierarchy for the SEMKO ERP system backend,
    including all Django apps, configuration files, and placeholder content for key files.
    Run this script from the directory where you want the 'semko' root folder to be created.
.NOTES
    Author: SEMKO In-House Development Team
    Version: 1.0
#>

# Stop on any error
$ErrorActionPreference = "Stop"

# Root folder name
$root = "semko"

# Function to create a file with optional content
function Create-File {
    param(
        [string]$Path,
        [string]$Content = ""
    )
    $fullPath = Join-Path -Path $root -ChildPath $Path
    $directory = Split-Path $fullPath -Parent
    if (!(Test-Path $directory)) {
        New-Item -ItemType Directory -Path $directory -Force | Out-Null
    }
    # Write content if not empty, otherwise create empty file
    if ([string]::IsNullOrEmpty($Content)) {
        New-Item -ItemType File -Path $fullPath -Force | Out-Null
    } else {
        Set-Content -Path $fullPath -Value $Content -Force
    }
}

Write-Host "Creating SEMKO project structure under '$root'..." -ForegroundColor Green

# Root-level files
Create-File "README.md" "# SEMKO Integrated Management System`n`nBackend API built with Django + DRF."
Create-File "docker-compose.yml" @"
version: '3.8'
services:
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: semko
      POSTGRES_USER: semko
      POSTGRES_PASSWORD: semko
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    depends_on:
      - db
    env_file:
      - ./backend/.env
    volumes:
      - ./backend:/app
volumes:
  postgres_data:
"@

# Backend root
Create-File "backend/manage.py" @"
#!/usr/bin/env python
import os
import sys

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'semko.settings.development')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
"@

Create-File "backend/pyproject.toml" @"
[tool.black]
line-length = 88

[tool.isort]
profile = "black"
"@

Create-File "backend/Dockerfile" @"
FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /app
COPY requirements/base.txt requirements/base.txt
RUN pip install --no-cache-dir -r requirements/base.txt
COPY . .
EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
"@

Create-File "backend/docker-compose.yml" @"
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "8000:8000"
    depends_on:
      - db
    env_file:
      - .env
    volumes:
      - .:/app
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: semko
      POSTGRES_USER: semko
      POSTGRES_PASSWORD: semko
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
volumes:
  postgres_data:
"@

Create-File "backend/.env.example" @"
# Django settings
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=semko
DB_USER=semko
DB_PASSWORD=semko
DB_HOST=db
DB_PORT=5432

# Email (example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-password
"@

Create-File "backend/README.md" "# SEMKO Backend API`n`nDjango + DRF project for fleet management."

# Requirements
Create-File "backend/requirements/base.txt" "# Core dependencies
Django==4.2
djangorestframework==3.14
psycopg2-binary==2.9
python-dotenv==1.0
"
Create-File "backend/requirements/dev.txt" "-r base.txt
django-debug-toolbar==4.0
black==23.0
"
Create-File "backend/requirements/prod.txt" "-r base.txt
gunicorn==20.1
"

# Project config (semko/)
Create-File "backend/semko/__init__.py" ""
Create-File "backend/semko/asgi.py" @"
import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'semko.settings.development')
application = get_asgi_application()
"@
Create-File "backend/semko/wsgi.py" @"
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'semko.settings.development')
application = get_wsgi_application()
"@
Create-File "backend/semko/urls.py" @"
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('apps.users.urls')),
    path('api/vehicles/', include('apps.vehicles.urls')),
    path('api/drivers/', include('apps.drivers.urls')),
    path('api/clients/', include('apps.clients.urls')),
    path('api/materials/', include('apps.materials.urls')),
    path('api/trips/', include('apps.trips.urls')),
    path('api/cess/', include('apps.cess.urls')),
    path('api/payroll/', include('apps.payroll.urls')),
    path('api/stores/', include('apps.stores.urls')),
    path('api/fuel/', include('apps.fuel.urls')),
    path('api/maintenance/', include('apps.maintenance.urls')),
    path('api/rules/', include('apps.rules.urls')),
    path('api/audit/', include('apps.audit.urls')),
    path('api/reports/', include('apps.reports.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
]
"@
Create-File "backend/semko/celery.py" @"
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'semko.settings.development')
app = Celery('semko')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
"@

# Settings
Create-File "backend/semko/settings/__init__.py" ""
Create-File "backend/semko/settings/base.py" @"
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'django-insecure-dev-key')
DEBUG = os.environ.get('DJANGO_DEBUG', 'True') == 'True'
ALLOWED_HOSTS = os.environ.get('DJANGO_ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
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

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ],
}

CELERY_BROKER_URL = 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'
"@
Create-File "backend/semko/settings/development.py" @"
from .base import *
DEBUG = True
"@
Create-File "backend/semko/settings/production.py" @"
from .base import *
DEBUG = False
ALLOWED_HOSTS = ['your-domain.com']
"@
Create-File "backend/semko/settings/testing.py" @"
from .base import *
DEBUG = True
"@

# Media directories
Create-File "backend/media/delivery_notes/.gitkeep" ""
Create-File "backend/media/cess_receipts/.gitkeep" ""
Create-File "backend/media/driver_docs/.gitkeep" ""

# Static
Create-File "backend/static/admin/.gitkeep" ""

# Scripts
Create-File "backend/scripts/deploy.sh" "#!/bin/bash\necho 'Deploy script'"
Create-File "backend/scripts/backup_db.sh" "#!/bin/bash\necho 'Backup DB'"
Create-File "backend/scripts/restore_db.sh" "#!/bin/bash\necho 'Restore DB'"
Create-File "backend/scripts/setup_dev.sh" "#!/bin/bash\necho 'Setup dev'"

# Nginx
Create-File "backend/nginx/nginx.conf" "server { listen 80; ... }"

# Apps base
$apps = @(
    "users",
    "vehicles",
    "drivers",
    "clients",
    "materials",
    "trips",
    "cess",
    "payroll",
    "stores",
    "fuel",
    "maintenance",
    "rules",
    "audit",
    "reports",
    "notifications",
    "core"
)

foreach ($app in $apps) {
    $base = "backend/apps/$app"
    # Common directories and files for all apps
    Create-File "$base/__init__.py" ""
    Create-File "$base/apps.py" "from django.apps import AppConfig`n`nclass $(($app.Substring(0,1).ToUpper() + $app.Substring(1)))Config(AppConfig):`n    default_auto_field = 'django.db.models.BigAutoField'`n    name = 'apps.$app'"
    Create-File "$base/admin.py" "from django.contrib import admin`n`n# Register your models here."
    Create-File "$base/urls.py" "from django.urls import path`n`nurlpatterns = []"
    Create-File "$base/models/__init__.py" ""
    Create-File "$base/views/__init__.py" ""
    Create-File "$base/views/api.py" "from rest_framework.views import APIView`nfrom rest_framework.response import Response`n`n# Add your views here"
    Create-File "$base/serializers/__init__.py" ""
    Create-File "$base/migrations/__init__.py" ""
    Create-File "$base/tests/__init__.py" ""

    # App-specific additional files (based on the provided structure)
    switch ($app) {
        "users" {
            Create-File "$base/models/user.py" ""
            Create-File "$base/models/role.py" ""
            Create-File "$base/serializers/user.py" ""
            Create-File "$base/permissions.py" ""
            Create-File "$base/signals.py" ""
            Create-File "$base/services.py" ""
        }
        "vehicles" {
            Create-File "$base/models/vehicle.py" ""
            Create-File "$base/models/vehicle_type.py" ""
            Create-File "$base/models/ownership.py" ""
            Create-File "$base/serializers/vehicle.py" ""
            Create-File "$base/services/__init__.py" ""
            Create-File "$base/services/availability.py" ""
            Create-File "$base/permissions.py" ""
            Create-File "$base/signals.py" ""
        }
        "drivers" {
            Create-File "$base/models/driver.py" ""
            Create-File "$base/models/license.py" ""
            Create-File "$base/serializers/driver.py" ""
            Create-File "$base/services.py" ""
            Create-File "$base/signals.py" ""
        }
        "clients" {
            Create-File "$base/models/client.py" ""
            Create-File "$base/models/corporate.py" ""
            Create-File "$base/models/individual.py" ""
            Create-File "$base/models/quarry.py" ""
            Create-File "$base/serializers/client.py" ""
            Create-File "$base/serializers/quarry.py" ""
            Create-File "$base/services.py" ""
        }
        "materials" {
            Create-File "$base/models/material.py" ""
            Create-File "$base/models/price.py" ""
            Create-File "$base/serializers/material.py" ""
            Create-File "$base/services.py" ""
        }
        "trips" {
            Create-File "$base/models/trip.py" ""
            Create-File "$base/models/weighbridge.py" ""
            Create-File "$base/models/discrepancy.py" ""
            Create-File "$base/models/hired_trip.py" ""
            Create-File "$base/serializers/trip.py" ""
            Create-File "$base/serializers/weighbridge.py" ""
            Create-File "$base/calculators/__init__.py" ""
            Create-File "$base/calculators/penalty.py" ""
            Create-File "$base/calculators/classification.py" ""
            Create-File "$base/services/__init__.py" ""
            Create-File "$base/services/trip_validation.py" ""
            Create-File "$base/permissions.py" ""
            Create-File "$base/signals.py" ""
            Create-File "$base/tasks.py" ""
        }
        "cess" {
            Create-File "$base/models/cess_rate.py" ""
            Create-File "$base/models/cess_transaction.py" ""
            Create-File "$base/models/receipt.py" ""
            Create-File "$base/serializers/cess_rate.py" ""
            Create-File "$base/calculators/__init__.py" ""
            Create-File "$base/calculators/cess_calculator.py" ""
            Create-File "$base/signals.py" ""
            Create-File "$base/tasks.py" ""
        }
        "payroll" {
            Create-File "$base/models/payroll_period.py" ""
            Create-File "$base/models/payslip.py" ""
            Create-File "$base/models/deduction.py" ""
            Create-File "$base/models/bonus.py" ""
            Create-File "$base/serializers/payslip.py" ""
            Create-File "$base/serializers/payroll.py" ""
            Create-File "$base/calculators/__init__.py" ""
            Create-File "$base/calculators/statutory.py" ""
            Create-File "$base/calculators/bonus_aggregator.py" ""
            Create-File "$base/calculators/net_pay.py" ""
            Create-File "$base/services.py" ""
            Create-File "$base/signals.py" ""
            Create-File "$base/tasks.py" ""
        }
        "stores" {
            Create-File "$base/models/item.py" ""
            Create-File "$base/models/stock_receiving.py" ""
            Create-File "$base/models/stock_issue.py" ""
            Create-File "$base/models/requisition.py" ""
            Create-File "$base/models/adjustment.py" ""
            Create-File "$base/serializers/item.py" ""
            Create-File "$base/serializers/transaction.py" ""
            Create-File "$base/services/__init__.py" ""
            Create-File "$base/services/stock_level.py" ""
            Create-File "$base/utils/__init__.py" ""
            Create-File "$base/utils/reorder.py" ""
            Create-File "$base/permissions.py" ""
            Create-File "$base/signals.py" ""
            Create-File "$base/tasks.py" ""
        }
        "fuel" {
            Create-File "$base/models/fuel_transaction.py" ""
            Create-File "$base/models/fuel_station.py" ""
            Create-File "$base/models/consumption.py" ""
            Create-File "$base/serializers/fuel.py" ""
            Create-File "$base/calculators/__init__.py" ""
            Create-File "$base/calculators/efficiency.py" ""
            Create-File "$base/signals.py" ""
            Create-File "$base/tasks.py" ""
        }
        "maintenance" {
            Create-File "$base/models/service_record.py" ""
            Create-File "$base/models/part_used.py" ""
            Create-File "$base/models/schedule.py" ""
            Create-File "$base/models/mechanic.py" ""
            Create-File "$base/serializers/maintenance.py" ""
            Create-File "$base/services/__init__.py" ""
            Create-File "$base/services/scheduling.py" ""
            Create-File "$base/signals.py" ""
            Create-File "$base/tasks.py" ""
        }
        "rules" {
            Create-File "$base/models/bonus_rule.py" ""
            Create-File "$base/models/trip_classification.py" ""
            Create-File "$base/models/statutory_rate.py" ""
            Create-File "$base/models/penalty_threshold.py" ""
            Create-File "$base/serializers/rule.py" ""
            Create-File "$base/engine/__init__.py" ""
            Create-File "$base/engine/bonus_evaluator.py" ""
            Create-File "$base/engine/classifier.py" ""
            Create-File "$base/signals.py" ""
            Create-File "$base/services.py" ""
        }
        "audit" {
            Create-File "$base/models/audit_log.py" ""
            Create-File "$base/middleware.py" ""
            Create-File "$base/signals.py" ""
            Create-File "$base/utils.py" ""
        }
        "reports" {
            Create-File "$base/templates/pdf/payslip.html" ""
            Create-File "$base/templates/pdf/trip_summary.html" ""
            Create-File "$base/templates/pdf/inventory.html" ""
            Create-File "$base/generators/__init__.py" ""
            Create-File "$base/generators/pdf_generator.py" ""
            Create-File "$base/generators/excel_generator.py" ""
            Create-File "$base/tasks.py" ""
            Create-File "$base/services.py" ""
            Create-File "$base/utils.py" ""
        }
        "notifications" {
            Create-File "$base/models/notification.py" ""
            Create-File "$base/models/template.py" ""
            Create-File "$base/models/log.py" ""
            Create-File "$base/serializers/notification.py" ""
            Create-File "$base/services/__init__.py" ""
            Create-File "$base/services/sms_service.py" ""
            Create-File "$base/services/email_service.py" ""
            Create-File "$base/services/notification_service.py" ""
            Create-File "$base/templates/sms/trip_assigned.txt" ""
            Create-File "$base/templates/sms/payslip_ready.txt" ""
            Create-File "$base/templates/sms/low_stock_alert.txt" ""
            Create-File "$base/tasks/__init__.py" ""
            Create-File "$base/tasks/send_notifications.py" ""
            Create-File "$base/tasks/reminder_scheduler.py" ""
            Create-File "$base/signals.py" ""
            Create-File "$base/utils.py" ""
        }
        "core" {
            Create-File "$base/models/base.py" ""
            Create-File "$base/utils/__init__.py" ""
            Create-File "$base/utils/permissions.py" ""
            Create-File "$base/utils/validators.py" ""
            Create-File "$base/utils/formatters.py" ""
            Create-File "$base/utils/helpers.py" ""
            Create-File "$base/utils/date_utils.py" ""
            Create-File "$base/mixins/__init__.py" ""
            Create-File "$base/mixins/api_mixins.py" ""
            Create-File "$base/management/commands/__init__.py" ""
            Create-File "$base/management/commands/seed_test_data.py" ""
            Create-File "$base/management/commands/generate_reports.py" ""
            Create-File "$base/management/commands/process_overdue.py" ""
            Create-File "$base/middleware.py" ""
            Create-File "$base/signals.py" ""
            Create-File "$base/services.py" ""
            Create-File "$base/permissions.py" ""
            Create-File "$base/constants.py" ""
        }
    }
}

Write-Host "SEMKO project structure created successfully!" -ForegroundColor Green