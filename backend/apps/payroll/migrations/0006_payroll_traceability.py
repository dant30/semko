import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("payroll", "0005_alter_bonusearning_bonus_type"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="PayrollActionLog",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("action", models.CharField(choices=[("generated", "Generated"), ("approved", "Approved"), ("locked", "Locked"), ("finalized", "Finalized")], max_length=20)),
                ("comment", models.TextField(blank=True)),
                ("metadata", models.JSONField(blank=True, default=dict)),
                ("actor", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="payroll_action_logs", to=settings.AUTH_USER_MODEL)),
                ("payroll_period", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="action_logs", to="payroll.payrollperiod")),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.AddField(
            model_name="payrollperiod",
            name="approval_comment",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="payrollperiod",
            name="lock_audit_note",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="payslip",
            name="finalized_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="payslip",
            name="finalized_by",
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="finalized_payslips", to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name="payslip",
            name="finalized_document",
            field=models.FileField(blank=True, null=True, upload_to="payroll/finalized_payslips/"),
        ),
    ]
