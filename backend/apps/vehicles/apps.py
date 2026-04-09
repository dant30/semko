from django.apps import AppConfig


class VehiclesConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.vehicles"

    def ready(self):
        from apps.vehicles import signals  # noqa: F401
