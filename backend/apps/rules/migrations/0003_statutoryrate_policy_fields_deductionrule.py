from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("rules", "0002_tripclassificationrule_bonus_amount"),
    ]

    operations = [
        migrations.AddField(
            model_name="statutoryrate",
            name="apply_on",
            field=models.CharField(
                choices=[
                    ("gross_trip_revenue", "Gross Trip Revenue"),
                    ("gross_bonus", "Gross Bonus Earnings"),
                    ("gross_policy", "Gross Policy Earnings"),
                ],
                default="gross_policy",
                max_length=30,
            ),
        ),
        migrations.AddField(
            model_name="statutoryrate",
            name="calculation_method",
            field=models.CharField(
                choices=[("fixed", "Fixed Amount"), ("percentage", "Percentage")],
                default="percentage",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="statutoryrate",
            name="description",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="statutoryrate",
            name="maximum_amount",
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True),
        ),
        migrations.AddField(
            model_name="statutoryrate",
            name="minimum_amount",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=12),
        ),
        migrations.AddField(
            model_name="statutoryrate",
            name="statutory_type",
            field=models.CharField(
                choices=[
                    ("paye", "PAYE"),
                    ("nssf", "NSSF"),
                    ("shif", "SHIF"),
                    ("housing_levy", "Housing Levy"),
                    ("other", "Other"),
                ],
                default="other",
                max_length=30,
            ),
        ),
        migrations.CreateModel(
            name="DeductionRule",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=150)),
                ("code", models.SlugField(max_length=100, unique=True)),
                (
                    "deduction_category",
                    models.CharField(
                        choices=[
                            ("advance_recovery", "Advance Recovery"),
                            ("document_non_compliance", "Document Non Compliance"),
                            ("disciplinary", "Disciplinary"),
                            ("other", "Other"),
                        ],
                        default="other",
                        max_length=40,
                    ),
                ),
                (
                    "calculation_method",
                    models.CharField(
                        choices=[("fixed", "Fixed Amount"), ("percentage", "Percentage")],
                        default="fixed",
                        max_length=20,
                    ),
                ),
                (
                    "apply_on",
                    models.CharField(
                        choices=[
                            ("gross_trip_revenue", "Gross Trip Revenue"),
                            ("gross_bonus", "Gross Bonus Earnings"),
                            ("gross_policy", "Gross Policy Earnings"),
                        ],
                        default="gross_policy",
                        max_length=30,
                    ),
                ),
                ("rate_value", models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ("minimum_verified_trips", models.PositiveIntegerField(default=0)),
                ("require_verified_documents", models.BooleanField(default=False)),
                ("effective_from", models.DateField()),
                ("effective_to", models.DateField(blank=True, null=True)),
                ("priority", models.PositiveIntegerField(default=100)),
                ("notes", models.TextField(blank=True)),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={"ordering": ["priority", "name"]},
        ),
    ]
