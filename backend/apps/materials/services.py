from django.utils import timezone

from apps.materials.models import MaterialPrice


def get_active_material_prices(on_date=None):
    check_date = on_date or timezone.now().date()
    return MaterialPrice.objects.filter(
        is_active=True,
        effective_from__lte=check_date,
    ).filter(
        effective_to__isnull=True,
    ) | MaterialPrice.objects.filter(
        is_active=True,
        effective_from__lte=check_date,
        effective_to__gte=check_date,
    )
