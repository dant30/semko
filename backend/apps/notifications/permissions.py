"""
Permission groups for notifications feature.

Follows the same pattern as stores, trips, and other features.
Groups related permissions for easy reference and consistency.
"""
from apps.core.constants import RolePermissionCodes


NOTIFICATION_VIEW_PERMISSIONS = [
    RolePermissionCodes.VIEW_NOTIFICATIONS,
]

NOTIFICATION_MANAGE_PERMISSIONS = [
    RolePermissionCodes.MANAGE_NOTIFICATIONS,
]

NOTIFICATION_ADMIN_PERMISSIONS = NOTIFICATION_MANAGE_PERMISSIONS + [
    # Admins can view + manage templates and preferences
]
