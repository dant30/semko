from django.urls import path

from apps.core.views.api import HealthCheckAPIView

urlpatterns = [
    path("health/", HealthCheckAPIView.as_view(), name="core-health"),
]
