# This migration is obsolete and conflicts with the updated 0001_initial schema.
# It attempted to rename indexes that don't exist in the new schema.
# Kept as a placeholder to maintain migration history.

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('vehicles', '0001_initial'),
    ]

    operations = [
        # Migration removed - these index renames are not needed with the new schema
    ]
