from django.urls import path

from apps.drivers.views.api import (
    DriverDetailAPIView,
    DriverLicenseDetailAPIView,
    DriverListCreateAPIView,
)

urlpatterns = [
    path("", DriverListCreateAPIView.as_view(), name="driver-list-create"),
    path("<int:pk>/", DriverDetailAPIView.as_view(), name="driver-detail"),
    path("licenses/<int:pk>/", DriverLicenseDetailAPIView.as_view(), name="driver-license-detail"),
]
