import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Material",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=150, unique=True)),
                ("code", models.SlugField(max_length=100, unique=True)),
                ("category", models.CharField(choices=[("aggregate", "Aggregate"), ("tarmac", "Tarmac"), ("sand", "Sand"), ("dust", "Dust"), ("other", "Other")], max_length=20)),
                ("unit_of_measure", models.CharField(choices=[("tonne", "Tonne"), ("cubic_meter", "Cubic Meter"), ("trip", "Trip")], max_length=20)),
                ("description", models.TextField(blank=True)),
                ("density_factor", models.DecimalField(blank=True, decimal_places=3, help_text="Optional conversion factor for operational calculations.", max_digits=8, null=True)),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={"ordering": ["name"]},
        ),
        migrations.CreateModel(
            name="MaterialPrice",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("price_per_unit", models.DecimalField(decimal_places=2, max_digits=12)),
                ("currency", models.CharField(default="KES", max_length=10)),
                ("effective_from", models.DateField()),
                ("effective_to", models.DateField(blank=True, null=True)),
                ("notes", models.TextField(blank=True)),
                ("is_active", models.BooleanField(default=True)),
                ("material", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="prices", to="materials.material")),
            ],
            options={"ordering": ["-effective_from", "-created_at"]},
        ),
        migrations.AddConstraint(
            model_name="materialprice",
            constraint=models.UniqueConstraint(fields=("material", "effective_from"), name="unique_material_effective_from"),
        ),
    ]
