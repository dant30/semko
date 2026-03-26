import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


def seed_notification_templates(apps, schema_editor):
    NotificationTemplate = apps.get_model("notifications", "NotificationTemplate")
    templates = [
        {
            "event_code": "payroll.period_approved",
            "audience": "finance",
            "channel": "in_app",
            "title_template": "Finance Review: {payroll_period_name} approved",
            "body_template": "Payroll period {payroll_period_name} is approved. Comment: {approval_comment}",
        },
        {
            "event_code": "payroll.period_approved",
            "audience": "hr",
            "channel": "in_app",
            "title_template": "HR Review: {payroll_period_name} approved",
            "body_template": "Payroll period {payroll_period_name} is approved and ready for HR review.",
        },
        {
            "event_code": "payroll.period_locked",
            "audience": "finance",
            "channel": "email",
            "title_template": "Finance Lock Notice: {payroll_period_name}",
            "body_template": "Locked payroll {payroll_period_name} with {finalized_payslip_count} finalized payslips.",
        },
        {
            "event_code": "payroll.period_locked",
            "audience": "hr",
            "channel": "in_app",
            "title_template": "HR Lock Notice: {payroll_period_name}",
            "body_template": "Payroll {payroll_period_name} is locked. Audit note: {lock_audit_note}",
        },
        {
            "event_code": "payroll.period_locked",
            "audience": "operations",
            "channel": "in_app",
            "title_template": "Operations Update: {payroll_period_name} locked",
            "body_template": "Operations can now reference locked payroll {payroll_period_name}.",
        },
        {
            "event_code": "payroll.payslip_ready",
            "audience": "driver",
            "channel": "in_app",
            "title_template": "Payslip Ready: {payroll_period_name}",
            "body_template": "Hello {driver_name}, your payslip for {payroll_period_name} is ready.",
        },
        {
            "event_code": "payroll.payslip_ready",
            "audience": "driver",
            "channel": "sms",
            "title_template": "Payslip Ready",
            "body_template": "{driver_name}, your {payroll_period_name} payslip is ready. Net pay: {net_trip_pay}",
        },
    ]
    for item in templates:
        NotificationTemplate.objects.update_or_create(
            event_code=item["event_code"],
            audience=item["audience"],
            channel=item["channel"],
            defaults={
                "title_template": item["title_template"],
                "body_template": item["body_template"],
                "is_active": True,
            },
        )


class Migration(migrations.Migration):
    dependencies = [
        ("notifications", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("users", "0003_alter_user_managers"),
    ]

    operations = [
        migrations.AddField(
            model_name="notification",
            name="audience",
            field=models.CharField(blank=True, max_length=50),
        ),
        migrations.AddField(
            model_name="notification",
            name="channel",
            field=models.CharField(
                choices=[("in_app", "In App"), ("email", "Email"), ("sms", "SMS")],
                default="in_app",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="notification",
            name="event_code",
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.CreateModel(
            name="NotificationPreference",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("channel", models.CharField(choices=[("in_app", "In App"), ("email", "Email"), ("sms", "SMS")], max_length=20)),
                ("category", models.CharField(blank=True, max_length=30)),
                ("event_code", models.CharField(blank=True, max_length=100)),
                ("is_enabled", models.BooleanField(default=True)),
                ("role", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="notification_preferences", to="users.role")),
                ("user", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="notification_preferences", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["channel", "category", "event_code"]},
        ),
        migrations.CreateModel(
            name="NotificationTemplate",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("event_code", models.CharField(max_length=100)),
                ("audience", models.CharField(default="general", max_length=50)),
                ("channel", models.CharField(choices=[("in_app", "In App"), ("email", "Email"), ("sms", "SMS")], max_length=20)),
                ("title_template", models.CharField(max_length=200)),
                ("body_template", models.TextField()),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={"ordering": ["event_code", "audience", "channel"]},
        ),
        migrations.AddConstraint(
            model_name="notificationtemplate",
            constraint=models.UniqueConstraint(fields=("event_code", "audience", "channel"), name="unique_notification_template_scope"),
        ),
        migrations.RunPython(seed_notification_templates, migrations.RunPython.noop),
    ]
