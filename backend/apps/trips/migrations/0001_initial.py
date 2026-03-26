import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("clients", "0001_initial"),
        ("drivers", "0001_initial"),
        ("materials", "0001_initial"),
        ("vehicles", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Trip",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("trip_number", models.CharField(max_length=50, unique=True)),
                ("delivery_note_number", models.CharField(max_length=100, unique=True)),
                ("trip_date", models.DateField()),
                ("dispatch_time", models.DateTimeField(blank=True, null=True)),
                ("arrival_time", models.DateTimeField(blank=True, null=True)),
                ("destination", models.CharField(max_length=200)),
                ("trip_type", models.CharField(choices=[("owned", "Owned Fleet"), ("hired", "Hired Fleet")], default="owned", max_length=20)),
                ("quantity_unit", models.CharField(blank=True, max_length=20)),
                ("expected_quantity", models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ("agreed_unit_price", models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ("status", models.CharField(choices=[("draft", "Draft"), ("in_progress", "In Progress"), ("delivered", "Delivered"), ("cancelled", "Cancelled")], default="draft", max_length=20)),
                ("remarks", models.TextField(blank=True)),
                ("is_active", models.BooleanField(default=True)),
                ("client", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="trips", to="clients.client")),
                ("driver", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="trips", to="drivers.driver")),
                ("material", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="trips", to="materials.material")),
                ("quarry", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="trips", to="clients.quarry")),
                ("vehicle", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="trips", to="vehicles.vehicle")),
            ],
            options={"ordering": ["-trip_date", "-created_at"]},
        ),
        migrations.CreateModel(
            name="WeighbridgeReading",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("quarry_gross_weight", models.DecimalField(decimal_places=2, max_digits=12)),
                ("quarry_tare_weight", models.DecimalField(decimal_places=2, max_digits=12)),
                ("quarry_net_weight", models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ("site_gross_weight", models.DecimalField(decimal_places=2, max_digits=12)),
                ("site_tare_weight", models.DecimalField(decimal_places=2, max_digits=12)),
                ("site_net_weight", models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ("trip", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="weighbridge_reading", to="trips.trip")),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="HiredTrip",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("owner_name", models.CharField(max_length=150)),
                ("owner_rate_per_trip", models.DecimalField(decimal_places=2, max_digits=12)),
                ("owner_total_amount", models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ("settlement_status", models.CharField(default="pending", max_length=20)),
                ("notes", models.TextField(blank=True)),
                ("trip", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="hired_trip", to="trips.trip")),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="Discrepancy",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("weight_difference", models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ("percentage_difference", models.DecimalField(decimal_places=2, default=0, max_digits=8)),
                ("tolerance_percentage", models.DecimalField(decimal_places=2, default=2.5, max_digits=5)),
                ("penalty_amount", models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ("within_tolerance", models.BooleanField(default=True)),
                ("notes", models.TextField(blank=True)),
                ("trip", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="discrepancy", to="trips.trip")),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]
