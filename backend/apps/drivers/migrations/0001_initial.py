import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Driver",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("employee_id", models.CharField(max_length=50, unique=True)),
                ("first_name", models.CharField(max_length=100)),
                ("last_name", models.CharField(max_length=100)),
                ("national_id", models.CharField(max_length=30, unique=True)),
                ("phone_number", models.CharField(max_length=20)),
                ("alternate_phone_number", models.CharField(blank=True, max_length=20)),
                ("email", models.EmailField(blank=True, max_length=254)),
                ("date_of_birth", models.DateField()),
                ("hire_date", models.DateField()),
                ("employment_status", models.CharField(choices=[("active", "Active"), ("on_leave", "On Leave"), ("suspended", "Suspended"), ("inactive", "Inactive"), ("terminated", "Terminated")], default="active", max_length=20)),
                ("emergency_contact_name", models.CharField(blank=True, max_length=150)),
                ("emergency_contact_phone", models.CharField(blank=True, max_length=20)),
                ("address", models.TextField(blank=True)),
                ("notes", models.TextField(blank=True)),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={"ordering": ["first_name", "last_name", "employee_id"]},
        ),
        migrations.CreateModel(
            name="DriverLicense",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("license_number", models.CharField(max_length=50, unique=True)),
                ("license_class", models.CharField(max_length=20)),
                ("issue_date", models.DateField()),
                ("expiry_date", models.DateField()),
                ("status", models.CharField(choices=[("valid", "Valid"), ("expired", "Expired"), ("suspended", "Suspended"), ("revoked", "Revoked")], default="valid", max_length=20)),
                ("issuing_authority", models.CharField(blank=True, max_length=150)),
                ("restrictions", models.TextField(blank=True)),
                ("notes", models.TextField(blank=True)),
                ("driver", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="license", to="drivers.driver")),
            ],
            options={"ordering": ["expiry_date", "license_number"]},
        ),
    ]
