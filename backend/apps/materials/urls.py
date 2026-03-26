from django.urls import path

from apps.materials.views.api import (
    MaterialDetailAPIView,
    MaterialListCreateAPIView,
    MaterialPriceDetailAPIView,
    MaterialPriceListCreateAPIView,
)

urlpatterns = [
    path("", MaterialListCreateAPIView.as_view(), name="material-list-create"),
    path("<int:pk>/", MaterialDetailAPIView.as_view(), name="material-detail"),
    path("prices/", MaterialPriceListCreateAPIView.as_view(), name="material-price-list-create"),
    path("prices/<int:pk>/", MaterialPriceDetailAPIView.as_view(), name="material-price-detail"),
]
