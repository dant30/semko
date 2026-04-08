# backend/semko/urls.py
from django.contrib import admin
from django.urls import path, include

from apps.core.views.api import HealthCheckAPIView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/health/', HealthCheckAPIView.as_view(), name='health'),
    path('api/v1/core/', include('apps.core.urls')),
    path('api/v1/users/', include('apps.users.urls')),
    path('api/v1/vehicles/', include('apps.vehicles.urls')),
    path('api/v1/drivers/', include('apps.drivers.urls')),
    path('api/v1/clients/', include('apps.clients.urls')),
    path('api/v1/materials/', include('apps.materials.urls')),
    path('api/v1/trips/', include('apps.trips.urls')),
    path('api/v1/cess/', include('apps.cess.urls')),
    path('api/v1/payroll/', include('apps.payroll.urls')),
    path('api/v1/stores/', include('apps.stores.urls')),
    path('api/v1/fuel/', include('apps.fuel.urls')),
    path('api/v1/maintenance/', include('apps.maintenance.urls')),
    path('api/v1/rules/', include('apps.rules.urls')),
    path('api/v1/audit/', include('apps.audit.urls')),
    path('api/v1/reports/', include('apps.reports.urls')),
    path('api/v1/notifications/', include('apps.notifications.urls')),
    # Backwards-compatible endpoint for legacy clients
    path('api/health/', HealthCheckAPIView.as_view(), name='health-legacy'),
    path('api/core/', include('apps.core.urls')),
    path('api/users/', include('apps.users.urls')),
    path('api/vehicles/', include('apps.vehicles.urls')),
    path('api/drivers/', include('apps.drivers.urls')),
    path('api/clients/', include('apps.clients.urls')),
    path('api/materials/', include('apps.materials.urls')),
    path('api/trips/', include('apps.trips.urls')),
    path('api/cess/', include('apps.cess.urls')),
    path('api/payroll/', include('apps.payroll.urls')),
    path('api/stores/', include('apps.stores.urls')),
    path('api/fuel/', include('apps.fuel.urls')),
    path('api/maintenance/', include('apps.maintenance.urls')),
    path('api/rules/', include('apps.rules.urls')),
    path('api/audit/', include('apps.audit.urls')),
    path('api/reports/', include('apps.reports.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
]
