# Generated migration for vehicles app with updated schema

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='VehicleType',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(max_length=100, unique=True)),
                ('code', models.SlugField(max_length=50, unique=True)),
                ('description', models.TextField(blank=True)),
                ('max_load_tonnes', models.DecimalField(blank=True, decimal_places=2, help_text='Maximum load capacity in metric tonnes', max_digits=10, null=True)),
                ('max_volume_cubic_meters', models.DecimalField(blank=True, decimal_places=2, help_text='Maximum cargo volume in cubic meters', max_digits=10, null=True)),
                ('typical_fuel_consumption_l_per_100km', models.DecimalField(blank=True, decimal_places=2, help_text='Average litres per 100 km', max_digits=6, null=True)),
                ('is_active', models.BooleanField(default=True)),
            ],
            options={
                'verbose_name': 'Vehicle Type',
                'verbose_name_plural': 'Vehicle Types',
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='Vehicle',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('registration_number', models.CharField(max_length=20, unique=True)),
                ('vin', models.CharField(max_length=50, unique=True, verbose_name='VIN/Chassis Number')),
                ('make', models.CharField(max_length=100)),
                ('model', models.CharField(max_length=100)),
                ('year', models.PositiveIntegerField()),
                ('fuel_type', models.CharField(choices=[('petrol', 'Petrol'), ('diesel', 'Diesel'), ('electric', 'Electric'), ('hybrid', 'Hybrid'), ('cng', 'Compressed Natural Gas')], default='diesel', max_length=20)),
                ('status', models.CharField(choices=[('active', 'Active'), ('under_maintenance', 'Under Maintenance'), ('retired', 'Retired'), ('standby', 'Standby')], default='active', max_length=20)),
                ('current_mileage_km', models.PositiveIntegerField(default=0)),
                ('seating_capacity', models.PositiveSmallIntegerField(default=2)),
                ('load_capacity_tonnes', models.DecimalField(blank=True, decimal_places=2, max_digits=8, null=True)),
                ('color', models.CharField(blank=True, max_length=50)),
                ('engine_number', models.CharField(blank=True, max_length=50)),
                ('last_maintenance_date', models.DateField(blank=True, null=True)),
                ('next_maintenance_due_km', models.PositiveIntegerField(blank=True, null=True)),
                ('next_maintenance_due_date', models.DateField(blank=True, null=True)),
                ('notes', models.TextField(blank=True)),
                ('is_active', models.BooleanField(default=True)),
                ('vehicle_type', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='vehicles', to='vehicles.vehicletype')),
            ],
            options={
                'ordering': ['registration_number'],
            },
        ),
        migrations.CreateModel(
            name='VehicleOwnership',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('ownership_type', models.CharField(choices=[('company_owned', 'Company Owned'), ('leased', 'Leased'), ('contract_hire', 'Contract Hire'), ('other', 'Other')], default='company_owned', max_length=20)),
                ('owner_name', models.CharField(blank=True, help_text='Leasing company or owner', max_length=200)),
                ('lease_start_date', models.DateField(blank=True, null=True)),
                ('lease_end_date', models.DateField(blank=True, null=True)),
                ('monthly_lease_cost', models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True)),
                ('registration_document_number', models.CharField(blank=True, max_length=100)),
                ('insurance_provider', models.CharField(blank=True, max_length=150)),
                ('insurance_policy_number', models.CharField(blank=True, max_length=100)),
                ('insurance_expiry_date', models.DateField(blank=True, null=True)),
                ('notes', models.TextField(blank=True)),
                ('vehicle', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='ownership', to='vehicles.vehicle')),
            ],
            options={
                'verbose_name': 'Vehicle Ownership',
                'verbose_name_plural': 'Vehicle Ownerships',
            },
        ),
        migrations.AddIndex(
            model_name='vehicle',
            index=models.Index(fields=['status', 'is_active'], name='vehicles_ve_status_idx'),
        ),
        migrations.AddIndex(
            model_name='vehicle',
            index=models.Index(fields=['vehicle_type'], name='vehicles_ve_vehicle_idx'),
        ),
    ]
