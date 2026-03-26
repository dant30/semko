import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("clients", "0001_initial"),
        ("materials", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="BonusRule",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=150)),
                ("code", models.SlugField(max_length=100, unique=True)),
                ("trigger_description", models.TextField(blank=True)),
                ("bonus_amount", models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={"ordering": ["name"]},
        ),
        migrations.CreateModel(
            name="PenaltyThresholdRule",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=150)),
                ("code", models.SlugField(max_length=100, unique=True)),
                ("minimum_percentage", models.DecimalField(decimal_places=2, default=0, max_digits=6)),
                ("maximum_percentage", models.DecimalField(blank=True, decimal_places=2, max_digits=6, null=True)),
                ("tolerance_percentage", models.DecimalField(decimal_places=2, default=2.5, max_digits=5)),
                ("penalty_multiplier", models.DecimalField(decimal_places=2, default=1.0, max_digits=6)),
                ("priority", models.PositiveIntegerField(default=100)),
                ("is_active", models.BooleanField(default=True)),
                ("notes", models.TextField(blank=True)),
            ],
            options={"ordering": ["priority", "minimum_percentage"]},
        ),
        migrations.CreateModel(
            name="StatutoryRate",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=150)),
                ("code", models.SlugField(max_length=100, unique=True)),
                ("rate_value", models.DecimalField(decimal_places=2, max_digits=10)),
                ("effective_from", models.DateField()),
                ("effective_to", models.DateField(blank=True, null=True)),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={"ordering": ["name", "-effective_from"]},
        ),
        migrations.CreateModel(
            name="TripClassificationRule",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=150)),
                ("code", models.SlugField(max_length=100, unique=True)),
                ("classification_label", models.CharField(max_length=100)),
                ("destination_keyword", models.CharField(blank=True, max_length=100)),
                ("priority", models.PositiveIntegerField(default=100)),
                ("is_active", models.BooleanField(default=True)),
                ("notes", models.TextField(blank=True)),
                ("client", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="trip_classification_rules", to="clients.client")),
                ("material", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="trip_classification_rules", to="materials.material")),
                ("quarry", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="trip_classification_rules", to="clients.quarry")),
            ],
            options={"ordering": ["priority", "name"]},
        ),
    ]
