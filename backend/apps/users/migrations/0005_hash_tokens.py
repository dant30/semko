# Generated migration: Hash tokens in blacklist for security

from django.db import migrations, models
import hashlib


def hash_existing_tokens(apps, schema_editor):
    """Hash all existing plaintext tokens."""
    TokenBlacklist = apps.get_model('users', 'TokenBlacklist')
    for entry in TokenBlacklist.objects.all():
        if hasattr(entry, 'token') and entry.token:
            try:
                token_hash = hashlib.sha256(entry.token.encode()).hexdigest()
                entry.token_hash = token_hash
                entry.save(update_fields=['token_hash'])
            except Exception:
                # Skip entries that can't be hashed
                pass


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0004_tokenblacklist_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='tokenblacklist',
            name='token_hash',
            field=models.CharField(db_index=True, default='', help_text='SHA-256 hash of the JWT token', max_length=64),
            preserve_default=False,
        ),
        migrations.RunPython(hash_existing_tokens),
        migrations.RemoveField(
            model_name='tokenblacklist',
            name='token',
        ),
        migrations.AlterField(
            model_name='tokenblacklist',
            name='token_hash',
            field=models.CharField(db_index=True, help_text='SHA-256 hash of the JWT token', max_length=64),
        ),
        migrations.AlterUniqueTogether(
            name='tokenblacklist',
            unique_together=set(),
        ),
        migrations.AlterIndexTogether(
            name='tokenblacklist',
            index_together=set(),
        ),
    ]
