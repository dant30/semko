import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("materials", "0001_initial"),
        ("trips", "0002_trip_classification_label"),
    ]

    operations = [
        migrations.CreateModel(
            name="CessRate",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=150)),
                ("code", models.SlugField(max_length=100, unique=True)),
                ("county", models.CharField(max_length=100)),
                ("rate_type", models.CharField(choices=[("per_trip", "Per Trip"), ("per_tonne", "Per Tonne"), ("per_cubic_meter", "Per Cubic Meter")], max_length=20)),
                ("amount", models.DecimalField(decimal_places=2, max_digits=12)),
                ("effective_from", models.DateField()),
                ("effective_to", models.DateField(blank=True, null=True)),
                ("is_active", models.BooleanField(default=True)),
                ("notes", models.TextField(blank=True)),
                ("material", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="cess_rates", to="materials.material")),
            ],
            options={"ordering": ["county", "material__name", "-effective_from"]},
        ),
        migrations.CreateModel(
            name="CessTransaction",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("county", models.CharField(max_length=100)),
                ("quantity", models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ("amount", models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ("status", models.CharField(choices=[("pending", "Pending"), ("assessed", "Assessed"), ("paid", "Paid"), ("verified", "Verified")], default="pending", max_length=20)),
                ("notes", models.TextField(blank=True)),
                ("cess_rate", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="transactions", to="cess.cessrate")),
                ("trip", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="cess_transaction", to="trips.trip")),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="CessReceipt",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("receipt_number", models.CharField(max_length=100, unique=True)),
                ("receipt_document", models.FileField(blank=True, null=True, upload_to="cess_receipts/")),
                ("payment_date", models.DateField()),
                ("amount_paid", models.DecimalField(decimal_places=2, max_digits=12)),
                ("verified", models.BooleanField(default=False)),
                ("notes", models.TextField(blank=True)),
                ("transaction", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="receipt", to="cess.cesstransaction")),
            ],
            options={"ordering": ["-payment_date", "-created_at"]},
        ),
    ]
