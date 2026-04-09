# backend/apps/drivers/services.py
from datetime import timedelta

from django.utils import timezone

from apps.drivers.models import DriverLicense


def get_expiring_licenses(days=30):
    today = timezone.now().date()
    cutoff = today + timedelta(days=days)
    return DriverLicense.objects.filter(expiry_date__range=(today, cutoff)).select_related(
        "driver"
    )
