# backend/semko/celery.py
import os
from celery import Celery

os.environ.setdefault(
    'DJANGO_SETTINGS_MODULE',
    os.environ.get('DJANGO_SETTINGS_MODULE', 'semko.settings.development'),
)

app = Celery('semko')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
app.conf.enable_utc = True
app.conf.timezone = os.environ.get('CELERY_TIMEZONE', 'Africa/Nairobi')
