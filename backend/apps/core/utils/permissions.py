def user_has_role_permission(user, permission_code):
    if not user or not getattr(user, "is_authenticated", False):
        return False
    if not getattr(user, "is_active", False):
        return False
    if getattr(user, "is_superuser", False):
        return True

    role = getattr(user, "role", None)
    if not role:
        return False

    return role.has_permission(permission_code)
