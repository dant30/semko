from django.db import models
from django.db.models import Case, F, Sum, Value, When
from django.db.models.fields import BooleanField, DecimalField

from apps.core.models import TimeStampedModel


class ItemQuerySet(models.QuerySet):
    def with_stock_snapshot(self):
        return self.annotate(
            total_received=Sum(
                Case(
                    When(receivings__is_active=True, then=F("receivings__quantity")),
                    default=Value(0),
                    output_field=DecimalField(max_digits=18, decimal_places=6),
                )
            ),
            total_issued=Sum(
                Case(
                    When(issues__is_active=True, then=F("issues__quantity")),
                    default=Value(0),
                    output_field=DecimalField(max_digits=18, decimal_places=6),
                )
            ),
            total_adjustment_increase=Sum(
                Case(
                    When(adjustments__is_active=True, adjustments__adjustment_type="increase", then=F("adjustments__quantity")),
                    default=Value(0),
                    output_field=DecimalField(max_digits=18, decimal_places=6),
                )
            ),
            total_adjustment_decrease=Sum(
                Case(
                    When(adjustments__is_active=True, adjustments__adjustment_type="decrease", then=F("adjustments__quantity")),
                    default=Value(0),
                    output_field=DecimalField(max_digits=18, decimal_places=6),
                )
            ),
        ).annotate(
            stock_on_hand=F("total_received")
            + F("total_adjustment_increase")
            - F("total_issued")
            - F("total_adjustment_decrease"),
            is_below_reorder_level=Case(
                When(stock_on_hand__lte=F("reorder_level"), then=Value(True)),
                default=Value(False),
                output_field=BooleanField(),
            ),
            reorder_status=Case(
                When(stock_on_hand__lte=F("reorder_level"), then=Value("at_or_below_reorder")),
                When(
                    stock_on_hand__lte=F("reorder_level") * Value(1.5, output_field=DecimalField(max_digits=18, decimal_places=6)),
                    then=Value("approaching_reorder"),
                ),
                default=Value("healthy"),
                output_field=models.CharField(max_length=30),
            ),
        )


class ItemManager(models.Manager):
    def get_queryset(self):
        return ItemQuerySet(self.model, using=self._db)

    def with_stock_snapshot(self):
        return self.get_queryset().with_stock_snapshot()


class Item(TimeStampedModel):
    objects = ItemManager()
    class ItemCategory(models.TextChoices):
        SPARE_PART = "spare_part", "Spare Part"
        CONSUMABLE = "consumable", "Consumable"
        TYRE = "tyre", "Tyre"
        LUBRICANT = "lubricant", "Lubricant"
        TOOLING = "tooling", "Tooling"
        OTHER = "other", "Other"

    class UnitOfMeasure(models.TextChoices):
        PIECE = "piece", "Piece"
        LITRE = "litre", "Litre"
        KILOGRAM = "kilogram", "Kilogram"
        SET = "set", "Set"
        BOX = "box", "Box"

    name = models.CharField(max_length=150, unique=True)
    code = models.SlugField(max_length=100, unique=True)
    category = models.CharField(max_length=20, choices=ItemCategory.choices)
    unit_of_measure = models.CharField(max_length=20, choices=UnitOfMeasure.choices)
    description = models.TextField(blank=True)
    reorder_level = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    standard_issue_quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return f"{self.name} ({self.code})"
