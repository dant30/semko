from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("trips", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="trip",
            name="classification_label",
            field=models.CharField(blank=True, max_length=100),
        ),
    ]
