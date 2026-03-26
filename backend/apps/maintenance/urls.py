from django.urls import path

from apps.maintenance.views.api import (
    MaintenanceScheduleDetailAPIView,
    MaintenanceScheduleListCreateAPIView,
    MechanicDetailAPIView,
    MechanicListCreateAPIView,
    PartUsedDetailAPIView,
    PartUsedListCreateAPIView,
    ServiceRecordDetailAPIView,
    ServiceRecordListCreateAPIView,
)

urlpatterns = [
    path("mechanics/", MechanicListCreateAPIView.as_view(), name="maintenance-mechanic-list-create"),
    path("mechanics/<int:pk>/", MechanicDetailAPIView.as_view(), name="maintenance-mechanic-detail"),
    path("schedules/", MaintenanceScheduleListCreateAPIView.as_view(), name="maintenance-schedule-list-create"),
    path("schedules/<int:pk>/", MaintenanceScheduleDetailAPIView.as_view(), name="maintenance-schedule-detail"),
    path("service-records/", ServiceRecordListCreateAPIView.as_view(), name="maintenance-service-record-list-create"),
    path("service-records/<int:pk>/", ServiceRecordDetailAPIView.as_view(), name="maintenance-service-record-detail"),
    path("parts-used/", PartUsedListCreateAPIView.as_view(), name="maintenance-part-used-list-create"),
    path("parts-used/<int:pk>/", PartUsedDetailAPIView.as_view(), name="maintenance-part-used-detail"),
]
