from django.urls import path

from apps.cess.views.api import (
    CessRateDetailAPIView,
    CessRateListCreateAPIView,
    CessTransactionDetailAPIView,
    CessTransactionListAPIView,
)

urlpatterns = [
    path("rates/", CessRateListCreateAPIView.as_view(), name="cess-rate-list-create"),
    path("rates/<int:pk>/", CessRateDetailAPIView.as_view(), name="cess-rate-detail"),
    path("transactions/", CessTransactionListAPIView.as_view(), name="cess-transaction-list"),
    path(
        "transactions/<int:pk>/",
        CessTransactionDetailAPIView.as_view(),
        name="cess-transaction-detail",
    ),
]
