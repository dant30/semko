import { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/core/store/hooks";
import { useAuthContext } from "@/features/auth/store/auth-context";
import { useNotifications } from "@/core/contexts/useNotifications";
import {
  setNotificationFilters,
  selectNotification,
  clearSelectedNotification,
  setNotificationViewType,
} from "@/features/notifications/store/notifications.slice";
import { notificationsApi } from "@/features/notifications/services/notifications.api";
import type {
  NotificationRecord,
  NotificationSummary,
  NotificationPreference,
  NotificationFilters,
  NotificationStatus,
  NotificationChannel,
} from "@/features/notifications/types/notification";

export function useNotificationsWorkspace() {
  const dispatch = useAppDispatch();
  const { showToast } = useNotifications();

  // Redux state
  const filters = useAppSelector((state) => state.notifications.filters);
  const selectedNotificationId = useAppSelector(
    (state) => state.notifications.selectedNotificationId
  );
  const viewType = useAppSelector((state) => state.notifications.viewType);
  const showDetailDrawer = useAppSelector(
    (state) => state.notifications.showDetailDrawer
  );

  // Local component state
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [archivedNotifications, setArchivedNotifications] = useState<NotificationRecord[]>([]);
  const [selectedNotificationDetail, setSelectedNotificationDetail] =
    useState<NotificationRecord | null>(null);
  const [summary, setSummary] = useState<NotificationSummary | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);

  // Loading states
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [isLoadingArchivedNotifications, setIsLoadingArchivedNotifications] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(false);

  // Error state
  const [error, setError] = useState("");
  const [detailError, setDetailError] = useState("");

  // ========================================================================
  // FETCH NOTIFICATIONS (INBOX)
  // ========================================================================

  const fetchNotifications = useCallback(async () => {
    setIsLoadingNotifications(true);
    setError("");

    try {
      const response = await notificationsApi.fetchInbox({
        search: filters.search || undefined,
        status: (filters.status as NotificationStatus | undefined) || undefined,
        channel: (filters.channel as NotificationChannel | undefined) || undefined,
        event_code: filters.eventCode || undefined,
      });

      // Handle both NotificationRecord[] and NotificationListResponse
      const notificationsList = Array.isArray(response)
        ? response
        : response.results || [];

      setNotifications(notificationsList);
    } catch {
      const message = "Failed to fetch notifications";
      setError(message);
      showToast({
        message: "Error loading notifications",
        title: "Load Error",
        tone: "danger",
      });
    } finally {
      setIsLoadingNotifications(false);
    }
  }, [filters.search, filters.status, filters.channel, filters.eventCode, showToast]);

  // ========================================================================
  // FETCH ARCHIVED NOTIFICATIONS
  // ========================================================================

  const fetchArchivedNotifications = useCallback(async () => {
    setIsLoadingArchivedNotifications(true);

    try {
      const response = await notificationsApi.fetchArchived({
        search: filters.search || undefined,
        status: (filters.status as NotificationStatus | undefined) || undefined,
        channel: (filters.channel as NotificationChannel | undefined) || undefined,
        event_code: filters.eventCode || undefined,
      });

      const archivedList = Array.isArray(response) ? response : response.results || [];
      setArchivedNotifications(archivedList);
    } catch {
      showToast({
        message: "Error loading archived notifications",
        tone: "danger",
      });
    } finally {
      setIsLoadingArchivedNotifications(false);
    }
  }, [filters.search, filters.status, filters.channel, filters.eventCode, showToast]);

  // Fetch notifications when filters change
  const { isAuthenticated } = useAuthContext();

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setArchivedNotifications([]);
      return;
    }

    void fetchNotifications();
    void fetchArchivedNotifications();
  }, [isAuthenticated, filters.search, filters.status, filters.channel, filters.eventCode, fetchNotifications, fetchArchivedNotifications]);

  // ========================================================================
  // FETCH SUMMARY
  // ========================================================================

  const fetchSummary = useCallback(async () => {
    setIsLoadingSummary(true);

    try {
      const summaryData = await notificationsApi.fetchSummary();
      // Normalize summary to ensure proper structure
      const normalizedSummary: NotificationSummary = {
        total_notifications: summaryData.total_notifications || 0,
        total_unread: summaryData.total_unread || 0,
        total_read: summaryData.total_read || 0,
        total_archived: summaryData.total_archived || 0,
        by_channel: (summaryData.by_channel || {
          email: 0,
          sms: 0,
          push: 0,
          in_app: 0,
        }) as Record<"email" | "sms" | "push" | "in_app", number>,
        by_status: (summaryData.by_status || {
          unread: 0,
          read: 0,
          archived: 0,
        }) as Record<"unread" | "read" | "archived", number>,
        recent_count: summaryData.recent_count || 0,
      };
      setSummary(normalizedSummary);
    } catch {
      showToast({
        message: "Error loading notification summary",
        tone: "danger",
      });
    } finally {
      setIsLoadingSummary(false);
    }
  }, [showToast]);

  // Fetch summary on mount
  useEffect(() => {
    void fetchSummary();
  }, [fetchSummary]);

  // ========================================================================
  // FETCH NOTIFICATION DETAIL
  // ========================================================================

  const fetchNotificationDetail = async (id: number) => {
    setIsLoadingDetail(true);
    setDetailError("");

    try {
      const response = await notificationsApi.fetchDetail(id);
      // API returns detail object with notification and logs
      setSelectedNotificationDetail(response.notification);
    } catch {
      const message = "Error loading notification details";
      setDetailError(message);
      showToast({
        message,
        tone: "danger",
      });
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // ========================================================================
  // SELECT NOTIFICATION (SHOW DETAIL DRAWER)
  // ========================================================================

  const selectNotificationDetail = (id: number) => {
    dispatch(selectNotification(id));
    fetchNotificationDetail(id);
  };

  // ========================================================================
  // MARK AS READ
  // ========================================================================

  const markAsRead = async (notificationIds: number | number[]) => {
    const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];

    try {
      const result = await notificationsApi.markAsRead(ids);

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          ids.includes(n.id)
            ? { ...n, status: "read" as const, read_at: new Date().toISOString() }
            : n
        )
      );

      showToast({
        message: `${result.updated_count} notification(s) marked as read`,
        title: "Success",
        tone: "success",
      });

      // Refresh summary
      await fetchSummary();
    } catch {
      showToast({
        message: "Error marking notifications as read",
        tone: "danger",
      });
    }
  };

  // ========================================================================
  // MARK ALL AS READ
  // ========================================================================

  const markAllAsRead = async () => {
    try {
      const result = await notificationsApi.markAllAsRead();

      // Refresh data
      await fetchNotifications();
      await fetchSummary();

      showToast({
        message: `All ${result.updated_count} notification(s) marked as read`,
        title: "Success",
        tone: "success",
      });
    } catch {
      showToast({
        message: "Error marking all notifications as read",
        tone: "danger",
      });
    }
  };

  // ========================================================================
  // MARK AS ARCHIVED
  // ========================================================================

  const markAsArchived = async (notificationIds: number | number[]) => {
    const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];

    try {
      const result = await notificationsApi.markAsArchived(ids);

      // Remove from inbox
      setNotifications((prev) => prev.filter((n) => !ids.includes(n.id)));

      showToast({
        message: `${result.updated_count} notification(s) archived`,
        title: "Success",
        tone: "success",
      });

      // Refresh summary
      await fetchSummary();
    } catch {
      showToast({
        message: "Error archiving notifications",
        tone: "danger",
      });
    }
  };

  // ========================================================================
  // DELETE NOTIFICATIONS
  // ========================================================================

  const deleteNotifications = async (notificationIds: number | number[]) => {
    const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];

    try {
      const result = await notificationsApi.deleteNotifications(ids);

      // Remove from state
      setNotifications((prev) => prev.filter((n) => !ids.includes(n.id)));

      showToast({
        message: `${result.deleted_count} notification(s) deleted`,
        title: "Success",
        tone: "success",
      });

      // Refresh summary
      await fetchSummary();
    } catch {
      showToast({
        message: "Error deleting notifications",
        tone: "danger",
      });
    }
  };

  // ========================================================================
  // FETCH PREFERENCES
  // ========================================================================

  const fetchUserPreferences = async () => {
    setIsLoadingPreferences(true);

    try {
      const prefs = await notificationsApi.fetchPreferences();
      setPreferences(prefs);
    } catch {
      setPreferences([]);
    } finally {
      setIsLoadingPreferences(false);
    }
  };

  // ========================================================================
  // UPDATE PREFERENCE
  // ========================================================================

  const updatePreference = async (
    preferenceId: number,
    data: { channels: NotificationChannel[]; enabled: boolean }
  ) => {
    try {
      const apiData = {
        channels: data.channels as string[],
        enabled: data.enabled,
      };

      const updatedPreference = await notificationsApi.updatePreference(
        preferenceId.toString(),
        apiData
      );

      // Update local state
      setPreferences((prev) =>
        prev.some((p) => p.id === preferenceId)
          ? prev.map((p) => (p.id === preferenceId ? updatedPreference : p))
          : [...prev, updatedPreference]
      );

      showToast({
        message: "Preference updated",
        title: "Success",
        tone: "success",
      });
    } catch {
      showToast({
        message: "Error updating preference",
        tone: "danger",
      });
    }
  };

  // ========================================================================
  // FILTER MANAGEMENT
  // ========================================================================

  const setFilters = (newFilters: Partial<NotificationFilters>) => {
    dispatch(setNotificationFilters(newFilters));
  };

  const resetFilters = () => {
    dispatch(
      setNotificationFilters({
        search: "",
        status: "unread",
        channel: "",
        eventCode: "",
      })
    );
  };

  // ========================================================================
  // VIEW MANAGEMENT
  // ========================================================================

  const setView = (view: "inbox" | "archived" | "preferences") => {
    dispatch(setNotificationViewType(view));
  };

  const closeDetailDrawer = () => {
    dispatch(clearSelectedNotification());
    setSelectedNotificationDetail(null);
  };

  // ========================================================================
  // RETURN PUBLIC API
  // ========================================================================

  return {
    // Notifications
    notifications,
    archivedNotifications,
    selectedNotificationDetail,
    summary,
    preferences,

    // Loading states
    isLoadingNotifications,
    isLoadingArchivedNotifications,
    isLoadingDetail,
    isLoadingSummary,
    isLoadingPreferences,
    error,
    detailError,

    // Filters
    filters,
    setFilters,
    resetFilters,

    // View
    viewType,
    showDetailDrawer,
    setView,

    // Selection
    selectedNotificationId,
    selectNotificationDetail,
    closeDetailDrawer,

    // Actions
    fetchNotifications,
    fetchSummary,
    fetchUserPreferences,
    markAsRead,
    markAllAsRead,
    markAsArchived,
    deleteNotifications,
    updatePreference,

    // UI helpers
    getUnreadCount: () => summary?.total_unread || 0,
  };
}
