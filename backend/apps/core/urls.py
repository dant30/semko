# backend/apps/core/urls.py
from django.urls import path

from apps.core.views.api import DashboardSummaryAPIView, HealthCheckAPIView

urlpatterns = [
    path("health/", HealthCheckAPIView.as_view(), name="core-health"),
    path(
        "dashboard/summary/",
        DashboardSummaryAPIView.as_view(),
        name="dashboard-summary",
    ),
]
