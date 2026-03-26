from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("trips", "0002_trip_classification_label"),
    ]

    operations = [
        migrations.AddField(
            model_name="trip",
            name="delivery_note_document",
            field=models.FileField(blank=True, null=True, upload_to="delivery_notes/"),
        ),
        migrations.AddField(
            model_name="trip",
            name="documents_verified",
            field=models.BooleanField(default=False),
        ),
    ]
