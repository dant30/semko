import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("drivers", "0001_initial"),
        ("payroll", "0003_alter_deduction_deduction_type"),
        ("users", "0003_alter_user_managers"),
    ]

    operations = [
        migrations.CreateModel(
            name="DriverCompensationProfile",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("base_salary", models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ("per_trip_allowance", models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ("communication_allowance", models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ("risk_allowance", models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ("effective_from", models.DateField()),
                ("effective_to", models.DateField(blank=True, null=True)),
                ("is_active", models.BooleanField(default=True)),
                ("notes", models.TextField(blank=True)),
                (
                    "driver",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="compensation_profile",
                        to="drivers.driver",
                    ),
                ),
            ],
            options={"ordering": ["driver__first_name", "driver__last_name"]},
        ),
        migrations.CreateModel(
            name="DriverPayrollItem",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("item_type", models.CharField(choices=[("earning", "Earning"), ("deduction", "Deduction")], max_length=20)),
                (
                    "recurrence",
                    models.CharField(
                        choices=[("monthly", "Monthly"), ("one_off", "One Off")],
                        default="monthly",
                        max_length=20,
                    ),
                ),
                ("description", models.CharField(max_length=200)),
                ("amount", models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ("effective_from", models.DateField()),
                ("effective_to", models.DateField(blank=True, null=True)),
                ("is_active", models.BooleanField(default=True)),
                ("notes", models.TextField(blank=True)),
                (
                    "driver",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="payroll_items",
                        to="drivers.driver",
                    ),
                ),
            ],
            options={"ordering": ["driver__first_name", "driver__last_name", "description"]},
        ),
        migrations.AddField(
            model_name="payrollperiod",
            name="approved_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="payrollperiod",
            name="approved_by",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="approved_payroll_periods",
                to="users.user",
            ),
        ),
        migrations.AddField(
            model_name="payrollperiod",
            name="locked_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="payrollperiod",
            name="locked_by",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="locked_payroll_periods",
                to="users.user",
            ),
        ),
        migrations.AlterField(
            model_name="payrollperiod",
            name="status",
            field=models.CharField(
                choices=[
                    ("draft", "Draft"),
                    ("processing", "Processing"),
                    ("completed", "Completed"),
                    ("approved", "Approved"),
                    ("locked", "Locked"),
                ],
                default="draft",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="payslip",
            name="gross_non_trip_earnings",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
    ]
