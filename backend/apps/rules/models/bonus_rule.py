from django.db import models

from apps.core.models import TimeStampedModel


class BonusRule(TimeStampedModel):
    name = models.CharField(max_length=150)
    code = models.SlugField(max_length=100, unique=True)
    trigger_description = models.TextField(blank=True)
    bonus_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name
