import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("drivers", "0001_initial"),
        ("trips", "0003_trip_documents_and_cess"),
    ]

    operations = [
        migrations.CreateModel(
            name="PayrollPeriod",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=100, unique=True)),
                ("start_date", models.DateField()),
                ("end_date", models.DateField()),
                ("status", models.CharField(choices=[("draft", "Draft"), ("processing", "Processing"), ("completed", "Completed")], default="draft", max_length=20)),
                ("notes", models.TextField(blank=True)),
            ],
            options={"ordering": ["-start_date"]},
        ),
        migrations.CreateModel(
            name="Payslip",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("delivered_trip_count", models.PositiveIntegerField(default=0)),
                ("verified_trip_count", models.PositiveIntegerField(default=0)),
                ("gross_trip_revenue", models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ("gross_bonus_earnings", models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ("total_deductions", models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ("net_trip_pay", models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ("total_cess_reference", models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ("total_hired_owner_settlement", models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ("driver", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="payslips", to="drivers.driver")),
                ("payroll_period", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="payslips", to="payroll.payrollperiod")),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.AddConstraint(
            model_name="payslip",
            constraint=models.UniqueConstraint(fields=("payroll_period", "driver"), name="unique_payslip_per_driver_period"),
        ),
        migrations.CreateModel(
            name="Deduction",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("deduction_type", models.CharField(choices=[("discrepancy", "Discrepancy"), ("other", "Other")], max_length=20)),
                ("description", models.CharField(max_length=200)),
                ("amount", models.DecimalField(decimal_places=2, max_digits=12)),
                ("payslip", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="deductions", to="payroll.payslip")),
                ("trip", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="payroll_deductions", to="trips.trip")),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="BonusEarning",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("bonus_type", models.CharField(choices=[("classification", "Classification"), ("other", "Other")], max_length=20)),
                ("description", models.CharField(max_length=200)),
                ("amount", models.DecimalField(decimal_places=2, max_digits=12)),
                ("payslip", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="bonus_earnings", to="payroll.payslip")),
                ("trip", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="payroll_bonus_earnings", to="trips.trip")),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]
