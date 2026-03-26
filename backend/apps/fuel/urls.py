from django.urls import path

from apps.fuel.views.api import (
    FuelConsumptionDetailAPIView,
    FuelConsumptionListCreateAPIView,
    FuelStationDetailAPIView,
    FuelStationListCreateAPIView,
    FuelTransactionDetailAPIView,
    FuelTransactionListCreateAPIView,
)

urlpatterns = [
    path("stations/", FuelStationListCreateAPIView.as_view(), name="fuel-station-list-create"),
    path("stations/<int:pk>/", FuelStationDetailAPIView.as_view(), name="fuel-station-detail"),
    path("", FuelTransactionListCreateAPIView.as_view(), name="fuel-transaction-list-create"),
    path("<int:pk>/", FuelTransactionDetailAPIView.as_view(), name="fuel-transaction-detail"),
    path("consumptions/", FuelConsumptionListCreateAPIView.as_view(), name="fuel-consumption-list-create"),
    path("consumptions/<int:pk>/", FuelConsumptionDetailAPIView.as_view(), name="fuel-consumption-detail"),
]
