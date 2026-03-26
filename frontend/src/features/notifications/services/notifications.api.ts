import { apiClient } from "@/core/api/client";
import { endpoints } from "@/core/api/endpoints";
import type {
  NotificationRecord,
  NotificationListResponse,
  NotificationDetailResponse,
  NotificationQueryParams,
  NotificationPreference,
  NotificationSummary,
  MarkAsReadPayload,
  MarkAsArchivedPayload,
} from "@/features/notifications/types/notification";

// ============================================================================
// RESPONSE NORMALIZATION
// ============================================================================

function normalizeNotificationListResponse(payload: unknown): NotificationRecord[] {
  if (Array.isArray(payload)) {
    return payload as NotificationRecord[];
  }

  if (
    payload &&
    typeof payload === "object" &&
    "results" in payload &&
    Array.isArray((payload as { results?: unknown[] }).results)
  ) {
    return (payload as { results: NotificationRecord[] }).results;
  }

  return [];
}

function normalizeResponse(payload: unknown): NotificationListResponse {
  if (
    payload &&
    typeof payload === "object" &&
    "results" in payload
  ) {
    return payload as NotificationListResponse;
  }

  return {
    count: 0,
    results: normalizeNotificationListResponse(payload),
  };
}

// ============================================================================
// API METHODS
// ============================================================================

export const notificationsApi = {
  /**
   * Fetch inbox notifications with optional filters.
   * @param params Query parameters for filtering and pagination
   */
  async fetchInbox(params?: Partial<NotificationQueryParams>) {
    const response = await apiClient.get<NotificationListResponse>(
      endpoints.notifications.inbox,
      {
        params: {
          page_size: 20,
          ordering: "-created_at",
          ...params,
        },
      }
    );

    return normalizeResponse(response.data);
  },

  /**
   * Fetch archived notifications.
   */
  async fetchArchived(params?: Partial<NotificationQueryParams>) {
    const response = await apiClient.get<NotificationListResponse>(
      `${endpoints.notifications.inbox}archived/`,
      {
        params: {
          page_size: 20,
          ordering: "-archived_at",
          ...params,
        },
      }
    );

    return normalizeResponse(response.data);
  },

  /**
   * Fetch a single notification detail with logs and related notifications.
   */
  async fetchDetail(id: number) {
    const response = await apiClient.get<NotificationDetailResponse>(
      `${endpoints.notifications.inbox}${id}/`
    );

    return response.data;
  },

  /**
   * Fetch notification summary/stats.
   */
  async fetchSummary() {
    try {
      const response = await apiClient.get<NotificationSummary>(
        `${endpoints.notifications.inbox}summary/`
      );
      return response.data;
    } catch {
      // Fallback if endpoint doesn't exist
      return {
        total_notifications: 0,
        total_unread: 0,
        total_read: 0,
        total_archived: 0,
        by_channel: {},
        by_status: {},
        recent_count: 0,
      };
    }
  },

  /**
   * Mark single or multiple notifications as read.
   */
  async markAsRead(notificationIds: number | number[]) {
    const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];
    const payload: MarkAsReadPayload = {
      notification_ids: ids,
    };

    const response = await apiClient.post<{ success: boolean; updated_count: number }>(
      `${endpoints.notifications.inbox}mark-as-read/`,
      payload
    );

    return response.data;
  },

  /**
   * Mark single or multiple notifications as archived.
   */
  async markAsArchived(notificationIds: number | number[]) {
    const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];
    const payload: MarkAsArchivedPayload = {
      notification_ids: ids,
    };

    const response = await apiClient.post<{ success: boolean; updated_count: number }>(
      `${endpoints.notifications.inbox}mark-as-archived/`,
      payload
    );

    return response.data;
  },

  /**
   * Delete single or multiple notifications.
   */
  async deleteNotifications(notificationIds: number | number[]) {
    const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];

    const response = await apiClient.post<{ success: boolean; deleted_count: number }>(
      `${endpoints.notifications.inbox}delete/`,
      {
        notification_ids: ids,
      }
    );

    return response.data;
  },

  /**
   * Fetch user's notification preferences.
   */
  async fetchPreferences() {
    try {
      const response = await apiClient.get<NotificationPreference[]>(
        `${endpoints.notifications.inbox}preferences/`
      );
      return response.data;
    } catch {
      return [];
    }
  },

  /**
   * Update notification preference for a specific event code.
   */
  async updatePreference(
    eventCode: string,
    data: {
      channels: string[];
      enabled: boolean;
    }
  ) {
    const response = await apiClient.post<NotificationPreference>(
      `${endpoints.notifications.inbox}preferences/`,
      {
        event_code: eventCode,
        ...data,
      }
    );

    return response.data;
  },

  /**
   * Mark all notifications as read.
   */
  async markAllAsRead() {
    const response = await apiClient.post<{ success: boolean; updated_count: number }>(
      `${endpoints.notifications.inbox}mark-all-as-read/`
    );

    return response.data;
  },

  /**
   * Get unread notification count.
   */
  async fetchUnreadCount() {
    try {
      const response = await apiClient.get<{ unread_count: number }>(
        `${endpoints.notifications.inbox}unread-count/`
      );
      return response.data.unread_count;
    } catch {
      return 0;
    }
  },

  /**
   * Create initial preference form values (factory helper).
   */
  createInitialPreferenceFormValues() {
    return {
      event_code: "",
      channels: [],
      enabled: true,
    };
  },
};
