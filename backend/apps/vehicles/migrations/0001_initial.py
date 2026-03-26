import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="VehicleOwnership",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=150)),
                ("ownership_type", models.CharField(choices=[("owned", "Owned"), ("hired", "Hired"), ("leased", "Leased")], max_length=20)),
                ("contact_person", models.CharField(blank=True, max_length=150)),
                ("phone_number", models.CharField(blank=True, max_length=20)),
                ("email", models.EmailField(blank=True, max_length=254)),
                ("contract_reference", models.CharField(blank=True, max_length=100)),
                ("effective_from", models.DateField()),
                ("effective_to", models.DateField(blank=True, null=True)),
                ("notes", models.TextField(blank=True)),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={"ordering": ["name", "-effective_from"]},
        ),
        migrations.CreateModel(
            name="VehicleType",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=100, unique=True)),
                ("code", models.SlugField(max_length=100, unique=True)),
                ("description", models.TextField(blank=True)),
                ("default_capacity_tonnes", models.DecimalField(blank=True, decimal_places=2, max_digits=8, null=True)),
                ("axle_count", models.PositiveSmallIntegerField(default=2)),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={"ordering": ["name"]},
        ),
        migrations.CreateModel(
            name="Vehicle",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("registration_number", models.CharField(max_length=20, unique=True)),
                ("fleet_number", models.CharField(max_length=50, unique=True)),
                ("make", models.CharField(max_length=100)),
                ("model", models.CharField(blank=True, max_length=100)),
                ("year", models.PositiveSmallIntegerField()),
                ("chassis_number", models.CharField(max_length=100, unique=True)),
                ("engine_number", models.CharField(blank=True, max_length=100)),
                ("color", models.CharField(blank=True, max_length=50)),
                ("capacity_tonnes", models.DecimalField(decimal_places=2, max_digits=8)),
                ("status", models.CharField(choices=[("active", "Active"), ("inactive", "Inactive"), ("maintenance", "Maintenance"), ("retired", "Retired")], default="active", max_length=20)),
                ("insurance_expiry", models.DateField(blank=True, null=True)),
                ("inspection_expiry", models.DateField(blank=True, null=True)),
                ("notes", models.TextField(blank=True)),
                ("is_active", models.BooleanField(default=True)),
                ("ownership", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="vehicles", to="vehicles.vehicleownership")),
                ("vehicle_type", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="vehicles", to="vehicles.vehicletype")),
            ],
            options={"ordering": ["registration_number"]},
        ),
    ]
