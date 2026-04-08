# Generated migration: Add database indexes on User model

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0005_hash_tokens'),
    ]

    operations = [
        migrations.AddIndex(
            model_name='user',
            index=models.Index(fields=['email'], name='users_user_email_idx'),
        ),
        migrations.AddIndex(
            model_name='user',
            index=models.Index(fields=['is_active', 'role'], name='users_user_active_role_idx'),
        ),
        migrations.AddIndex(
            model_name='user',
            index=models.Index(fields=['role'], name='users_user_role_idx'),
        ),
    ]
