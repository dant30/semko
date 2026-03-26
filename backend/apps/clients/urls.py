from django.urls import path

from apps.clients.views.api import (
    ClientDetailAPIView,
    ClientListCreateAPIView,
    QuarryDetailAPIView,
    QuarryListCreateAPIView,
)

urlpatterns = [
    path("", ClientListCreateAPIView.as_view(), name="client-list-create"),
    path("<int:pk>/", ClientDetailAPIView.as_view(), name="client-detail"),
    path("quarries/", QuarryListCreateAPIView.as_view(), name="quarry-list-create"),
    path("quarries/<int:pk>/", QuarryDetailAPIView.as_view(), name="quarry-detail"),
]
