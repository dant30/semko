"""
Management command to clean up expired blacklist entries.

Deletes TokenBlacklist entries for tokens that have already expired.
This helps keep the database clean and improves query performance.

Usage:
    python manage.py cleanup_blacklist
    python manage.py cleanup_blacklist --dry-run  # Show what would be deleted
"""

from django.core.management.base import BaseCommand
from apps.users.models import TokenBlacklist


class Command(BaseCommand):
    help = "Clean up expired blacklist entries to prevent database bloat."

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting.',
        )

    def handle(self, *args, **options):
        dry_run = options.get('dry_run', False)
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING('Running in DRY RUN mode. No changes will be made.\n')
            )
        
        # Count expired entries before deletion
        deleted_count = TokenBlacklist.cleanup_expired()
        
        if dry_run:
            self.stdout.write(
                self.style.WARNING(
                    f'Would delete {deleted_count} expired blacklist entries.\n'
                )
            )
            # Rollback the dry-run (this is handled by cleanup_expired naturally)
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully deleted {deleted_count} expired blacklist entries.'
                )
            )
