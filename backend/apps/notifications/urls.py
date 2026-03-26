from django.urls import path

from apps.notifications.views.api import (
    NotificationArchivedListAPIView,
    NotificationBulkDeleteAPIView,
    NotificationBulkMarkArchivedAPIView,
    NotificationBulkMarkReadAPIView,
    NotificationDetailAPIView,
    NotificationListAPIView,
    NotificationMarkReadAPIView,
    NotificationPreferenceDetailAPIView,
    NotificationPreferenceListCreateAPIView,
    NotificationSummaryAPIView,
    NotificationTemplateDetailAPIView,
    NotificationTemplateListCreateAPIView,
)

urlpatterns = [
    path("", NotificationListAPIView.as_view(), name="notification-list"),
    path("archived/", NotificationArchivedListAPIView.as_view(), name="notification-archived-list"),
    path("summary/", NotificationSummaryAPIView.as_view(), name="notification-summary"),
    path("<int:pk>/", NotificationDetailAPIView.as_view(), name="notification-detail"),
    path("<int:pk>/read/", NotificationMarkReadAPIView.as_view(), name="notification-mark-read"),
    path("mark-as-read/", NotificationBulkMarkReadAPIView.as_view(), name="notification-bulk-mark-read"),
    path("mark-as-archived/", NotificationBulkMarkArchivedAPIView.as_view(), name="notification-bulk-mark-archived"),
    path("delete/", NotificationBulkDeleteAPIView.as_view(), name="notification-bulk-delete"),
    path("templates/", NotificationTemplateListCreateAPIView.as_view(), name="notification-template-list-create"),
    path("templates/<int:pk>/", NotificationTemplateDetailAPIView.as_view(), name="notification-template-detail"),
    path("preferences/", NotificationPreferenceListCreateAPIView.as_view(), name="notification-preference-list-create"),
    path("preferences/<int:pk>/", NotificationPreferenceDetailAPIView.as_view(), name="notification-preference-detail"),
]
