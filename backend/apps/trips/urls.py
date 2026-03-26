from django.urls import path

from apps.trips.views.api import (
    TripDetailAPIView,
    TripDocumentDownloadAPIView,
    TripDocumentMetadataAPIView,
    TripDocumentUpdateAPIView,
    TripListCreateAPIView,
    TripOperationsSummaryAPIView,
    TripSummaryAPIView,
)

urlpatterns = [
    path("summary/", TripOperationsSummaryAPIView.as_view(), name="trip-operations-summary"),
    path("", TripListCreateAPIView.as_view(), name="trip-list-create"),
    path("<int:pk>/documents/", TripDocumentUpdateAPIView.as_view(), name="trip-document-update"),
    path("<int:pk>/documents/metadata/", TripDocumentMetadataAPIView.as_view(), name="trip-document-metadata"),
    path("<int:pk>/documents/view/", TripDocumentDownloadAPIView.as_view(), name="trip-document-download"),
    path("<int:pk>/summary/", TripSummaryAPIView.as_view(), name="trip-summary"),
    path("<int:pk>/", TripDetailAPIView.as_view(), name="trip-detail"),
]
