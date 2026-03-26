import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'semko.settings.development')
app = Celery('semko')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
