/**
 * Notification types and interfaces.
 *
 * Mirrors backend models and provides a single source of truth for type safety.
 * Organized by entity: Notification, NotificationLog, NotificationTemplate, NotificationPreference.
 */

// ============================================================================
// NOTIFICATION STATUS & CHANNEL CONSTANTS
// ============================================================================

export type NotificationStatus = "unread" | "read" | "archived";
export type NotificationChannel = "email" | "sms" | "push" | "in_app";

export const NotificationStatuses = {
  UNREAD: "unread" as NotificationStatus,
  READ: "read" as NotificationStatus,
  ARCHIVED: "archived" as NotificationStatus,
} as const;

export const NotificationChannels = {
  EMAIL: "email" as NotificationChannel,
  SMS: "sms" as NotificationChannel,
  PUSH: "push" as NotificationChannel,
  IN_APP: "in_app" as NotificationChannel,
} as const;

// Common event codes across the system
export type NotificationEventCode =
  | "trip.created"
  | "trip.completed"
  | "trip.delayed"
  | "stock.below_reorder"
  | "purchase_order.approved"
  | "goods.received"
  | "user.created"
  | "user.role_changed"
  | "payslip.ready"
  | "payroll.processed"
  | "maintenance.due"
  | "service.completed"
  | "fuel.high_consumption"
  | "audit.critical_action"
  | string;

// Audience targeting for notifications
export type NotificationAudience =
  | "operations"
  | "drivers"
  | "stores"
  | "procurement"
  | "finance"
  | "hr"
  | "admin"
  | "fleet"
  | "maintenance"
  | "management"
  | "payroll"
  | "reports"
  | "general"
  | string;

// ============================================================================
// NOTIFICATION RECORD (IN-APP NOTIFICATION)
// ============================================================================

export interface NotificationRecord {
  id: number;
  title: string;
  message: string;
  status: NotificationStatus;
  channel: NotificationChannel;
  event_code: NotificationEventCode;
  audience: NotificationAudience;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
  read_at?: string | null;
  archived_at?: string | null;
}

// ============================================================================
// NOTIFICATION LOG (DELIVERY AUDIT TRAIL)
// ============================================================================

export type NotificationLogStatus = "pending" | "sent" | "failed" | "bounced";

export interface NotificationLog {
  id: number;
  notification: number;
  channel: NotificationChannel;
  status: NotificationLogStatus;
  recipient?: string;
  error_message?: string;
  attempted_at?: string;
  sent_at?: string;
  created_at: string;
}

// ============================================================================
// NOTIFICATION TEMPLATE (BACKEND TEMPLATE FOR RENDERING)
// ============================================================================

export interface NotificationTemplate {
  id: number;
  event_code: NotificationEventCode;
  audience: NotificationAudience;
  title_template: string;
  message_template: string;
  subject_template?: string;
  sms_template?: string;
  channels: NotificationChannel[];
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

// ============================================================================
// NOTIFICATION PREFERENCE (USER + ROLE OVERRIDES)
// ============================================================================

export interface NotificationPreference {
  id: number;
  user?: number;
  role?: number;
  event_code: NotificationEventCode;
  channels: NotificationChannel[];
  enabled: boolean;
  created_at: string;
  updated_at?: string;
}

// ============================================================================
// NOTIFICATION SUMMARY / STATS
// ============================================================================

export interface NotificationSummary {
  total_notifications: number;
  total_unread: number;
  total_read: number;
  total_archived: number;
  by_channel: Record<NotificationChannel, number>;
  by_status: Record<NotificationStatus, number>;
  recent_count: number;
}

// ============================================================================
// FILTERS & QUERY PARAMETERS
// ============================================================================

export interface NotificationFilters {
  search: string;
  status: NotificationStatus | "";
  channel: NotificationChannel | "";
  eventCode: NotificationEventCode | "";
  activeOnly?: boolean;
}

export interface NotificationQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: NotificationStatus;
  channel?: NotificationChannel;
  event_code?: NotificationEventCode;
  ordering?: string;
}

// ============================================================================
// FORM VALUES (USER INPUT)
// ============================================================================

export interface NotificationPreferenceFormValues {
  event_code: NotificationEventCode;
  channels: NotificationChannel[];
  enabled: boolean;
}

export interface NotificationFilterFormValues {
  search: string;
  status: NotificationStatus | "";
  channel: NotificationChannel | "";
  eventCode: NotificationEventCode | "";
}

export type NotificationViewType = "inbox" | "archived" | "preferences";

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface NotificationListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: NotificationRecord[];
}

export interface NotificationDetailResponse {
  notification: NotificationRecord;
  logs: NotificationLog[];
  related_notifications: NotificationRecord[];
}

// ============================================================================
// BULK OPERATION PAYLOADS
// ============================================================================

export interface MarkAsReadPayload {
  notification_ids: number[];
}

export interface MarkAsArchivedPayload {
  notification_ids: number[];
}

export interface DeleteNotificationPayload {
  notification_ids: number[];
}

// ============================================================================
// UNION TYPES (FOR BROADER USE)
// ============================================================================

export type NotificationEntity =
  | NotificationRecord
  | NotificationLog
  | NotificationTemplate
  | NotificationPreference;

export type NotificationAction = "read" | "archive" | "delete" | "restore";
