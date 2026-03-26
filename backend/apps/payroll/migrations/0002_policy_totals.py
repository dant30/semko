from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("payroll", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="payslip",
            name="gross_policy_earnings",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
        migrations.AddField(
            model_name="payslip",
            name="policy_deduction_total",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
        migrations.AddField(
            model_name="payslip",
            name="statutory_deduction_total",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
        migrations.AddField(
            model_name="payslip",
            name="trip_deduction_total",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
    ]
