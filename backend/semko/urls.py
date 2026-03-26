from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
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
