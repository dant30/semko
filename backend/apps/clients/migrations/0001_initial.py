import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Client",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=150)),
                ("code", models.SlugField(max_length=100, unique=True)),
                ("client_type", models.CharField(choices=[("corporate", "Corporate"), ("individual", "Individual")], max_length=20)),
                ("contact_person", models.CharField(blank=True, max_length=150)),
                ("phone_number", models.CharField(max_length=20)),
                ("alternate_phone_number", models.CharField(blank=True, max_length=20)),
                ("email", models.EmailField(blank=True, max_length=254)),
                ("address", models.TextField(blank=True)),
                ("town", models.CharField(blank=True, max_length=100)),
                ("county", models.CharField(blank=True, max_length=100)),
                ("status", models.CharField(choices=[("active", "Active"), ("inactive", "Inactive"), ("suspended", "Suspended")], default="active", max_length=20)),
                ("notes", models.TextField(blank=True)),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={"ordering": ["name", "code"]},
        ),
        migrations.CreateModel(
            name="CorporateClientProfile",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("company_registration_number", models.CharField(max_length=100, unique=True)),
                ("kra_pin", models.CharField(max_length=20, unique=True)),
                ("credit_limit", models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True)),
                ("payment_terms_days", models.PositiveIntegerField(default=30)),
                ("industry", models.CharField(blank=True, max_length=100)),
                ("client", models.OneToOneField(limit_choices_to={"client_type": "corporate"}, on_delete=django.db.models.deletion.CASCADE, related_name="corporate_profile", to="clients.client")),
            ],
            options={"ordering": ["client__name"]},
        ),
        migrations.CreateModel(
            name="IndividualClientProfile",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("national_id", models.CharField(max_length=30, unique=True)),
                ("kra_pin", models.CharField(blank=True, max_length=20)),
                ("occupation", models.CharField(blank=True, max_length=100)),
                ("client", models.OneToOneField(limit_choices_to={"client_type": "individual"}, on_delete=django.db.models.deletion.CASCADE, related_name="individual_profile", to="clients.client")),
            ],
            options={"ordering": ["client__name"]},
        ),
        migrations.CreateModel(
            name="Quarry",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=150, unique=True)),
                ("code", models.SlugField(max_length=100, unique=True)),
                ("county", models.CharField(max_length=100)),
                ("town", models.CharField(blank=True, max_length=100)),
                ("location_description", models.TextField(blank=True)),
                ("contact_person", models.CharField(blank=True, max_length=150)),
                ("phone_number", models.CharField(blank=True, max_length=20)),
                ("email", models.EmailField(blank=True, max_length=254)),
                ("is_active", models.BooleanField(default=True)),
                ("notes", models.TextField(blank=True)),
                ("client", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="quarries", to="clients.client")),
            ],
            options={"ordering": ["name"]},
        ),
    ]
