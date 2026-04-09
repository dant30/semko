from django.urls import path

from apps.vehicles.views.api import (
    VehicleDetailAPIView,
    VehicleListCreateAPIView,
    VehicleOwnershipDetailAPIView,
    VehicleTypeDetailAPIView,
    VehicleTypeListCreateAPIView,
)

urlpatterns = [
    path("types/", VehicleTypeListCreateAPIView.as_view(), name="vehicle-type-list-create"),
    path("types/<int:pk>/", VehicleTypeDetailAPIView.as_view(), name="vehicle-type-detail"),
    path("", VehicleListCreateAPIView.as_view(), name="vehicle-list-create"),
    path("<int:pk>/", VehicleDetailAPIView.as_view(), name="vehicle-detail"),
    path("<int:pk>/ownership/", VehicleOwnershipDetailAPIView.as_view(), name="vehicle-ownership-detail"),
]
