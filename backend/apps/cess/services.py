from django.utils import timezone

from apps.cess.models import CessRate


def resolve_applicable_cess_rate(*, county, material, on_date=None):
    effective_date = on_date or timezone.now().date()
    return (
        CessRate.objects.filter(
            county__iexact=county,
            material=material,
            is_active=True,
            effective_from__lte=effective_date,
        )
        .filter(effective_to__isnull=True)
        .order_by("-effective_from")
        .first()
        or CessRate.objects.filter(
            county__iexact=county,
            material=material,
            is_active=True,
            effective_from__lte=effective_date,
            effective_to__gte=effective_date,
        )
        .order_by("-effective_from")
        .first()
    )
