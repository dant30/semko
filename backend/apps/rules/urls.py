from django.urls import path

from apps.rules.views.api import (
    DeductionRuleDetailAPIView,
    DeductionRuleListCreateAPIView,
    EvaluateTripRulesAPIView,
    PenaltyThresholdRuleDetailAPIView,
    PenaltyThresholdRuleListCreateAPIView,
    StatutoryRateDetailAPIView,
    StatutoryRateListCreateAPIView,
    TripClassificationRuleDetailAPIView,
    TripClassificationRuleListCreateAPIView,
)

urlpatterns = [
    path(
        "trip-classifications/",
        TripClassificationRuleListCreateAPIView.as_view(),
        name="trip-classification-rule-list-create",
    ),
    path(
        "trip-classifications/<int:pk>/",
        TripClassificationRuleDetailAPIView.as_view(),
        name="trip-classification-rule-detail",
    ),
    path(
        "penalty-thresholds/",
        PenaltyThresholdRuleListCreateAPIView.as_view(),
        name="penalty-threshold-rule-list-create",
    ),
    path(
        "penalty-thresholds/<int:pk>/",
        PenaltyThresholdRuleDetailAPIView.as_view(),
        name="penalty-threshold-rule-detail",
    ),
    path(
        "statutory-rates/",
        StatutoryRateListCreateAPIView.as_view(),
        name="statutory-rate-list-create",
    ),
    path(
        "statutory-rates/<int:pk>/",
        StatutoryRateDetailAPIView.as_view(),
        name="statutory-rate-detail",
    ),
    path(
        "deduction-rules/",
        DeductionRuleListCreateAPIView.as_view(),
        name="deduction-rule-list-create",
    ),
    path(
        "deduction-rules/<int:pk>/",
        DeductionRuleDetailAPIView.as_view(),
        name="deduction-rule-detail",
    ),
    path("evaluate-trip/", EvaluateTripRulesAPIView.as_view(), name="evaluate-trip-rules"),
]
