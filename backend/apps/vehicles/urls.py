# backend/apps/vehicles/urls.py
from django.urls import path

from apps.vehicles.views.api import (
    VehicleDetailAPIView,
    VehicleListCreateAPIView,
    VehicleMileageUpdateAPIView,
    VehicleOwnershipDetailAPIView,
    VehicleOwnershipListCreateAPIView,
    VehicleTypeDetailAPIView,
    VehicleTypeListCreateAPIView,
)

urlpatterns = [
    path("types/", VehicleTypeListCreateAPIView.as_view(), name="vehicle-type-list-create"),
    path("types/<int:pk>/", VehicleTypeDetailAPIView.as_view(), name="vehicle-type-detail"),
    path("ownership/", VehicleOwnershipListCreateAPIView.as_view(), name="vehicle-ownership-list-create"),
    path("ownership/<int:pk>/", VehicleOwnershipDetailAPIView.as_view(), name="vehicle-ownership-detail"),
    path("", VehicleListCreateAPIView.as_view(), name="vehicle-list-create"),
    path("<int:pk>/", VehicleDetailAPIView.as_view(), name="vehicle-detail"),
    path("<int:pk>/mileage/", VehicleMileageUpdateAPIView.as_view(), name="vehicle-mileage-update"),
]
