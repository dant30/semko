import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { appRoutes } from "@/core/constants/routes";
import { useNotificationsWorkspace } from "@/features/notifications/hooks";
import type {
  NotificationChannel,
  NotificationRecord,
  NotificationStatus,
} from "@/features/notifications/types/notification";
import { NotificationsSummaryCards } from "@/features/notifications/components/NotificationsSummaryCards";
import { NotificationsViewTabs } from "@/features/notifications/components/NotificationsViewTabs";
import { NotificationsTable } from "@/features/notifications/components/NotificationsTable";
import { NotificationsPreferencesPanel } from "@/features/notifications/components/NotificationsPreferencesPanel";
import { NotificationDetailDrawer } from "@/features/notifications/components/NotificationDetailDrawer";
import { Button } from "@/shared/components/ui/Button";
import { SearchInput } from "@/shared/components/ui/SearchInput";
import { Select } from "@/shared/components/ui/Select";
import { Card } from "@/shared/components/ui/Card";
import { PageHeading } from "@/shared/components/ui/PageHeading";

const statusOptions = [
  { value: "", label: "All statuses" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
  { value: "archived", label: "Archived" },
];

const channelOptions = [
  { value: "", label: "All channels" },
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "push", label: "Push" },
  { value: "in_app", label: "In app" },
];

export function NotificationsPage() {
  const navigate = useNavigate();
  const {
    notifications,
    summary,
    filters,
    isLoadingNotifications,
    isLoadingSummary,
    error,
    viewType,
    setView,
    setFilters,
    resetFilters,
    selectNotificationDetail,
    markAsRead,
    markAllAsRead,
    markAsArchived,
    preferences,
    fetchUserPreferences,
    showDetailDrawer,
    selectedNotificationDetail,
    closeDetailDrawer,
  } = useNotificationsWorkspace();

  const activeView = viewType || "inbox";

  const notificationItems = useMemo<NotificationRecord[]>(() => {
    if (activeView === "archived") return notifications.filter((n) => n.status === "archived");
    if (activeView === "inbox") return notifications.filter((n) => n.status !== "archived");
    return notifications;
  }, [activeView, notifications]);

  const eventOptions = useMemo(
    () => [
      { value: "", label: "All events" },
      ...Array.from(new Set(notificationItems.map((item) => item.event_code)))
        .sort()
        .map((event_code) => ({ value: event_code, label: event_code })),
    ],
    [notificationItems]
  );

  const handleAction = (notification: NotificationRecord) => {
    if (notification.metadata?.action_url) {
      window.open(notification.metadata.action_url, "_blank", "noopener noreferrer");
      return;
    }

    if (notification.metadata?.action_type && notification.metadata.action_type.startsWith("/")) {
      navigate(notification.metadata.action_type);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
      <PageHeading>Notifications</PageHeading>

      <section className="space-y-4">
        <NotificationsSummaryCards summary={summary} isLoading={isLoadingSummary} />
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <NotificationsViewTabs
            viewType={activeView}
            onChange={(value) => {
              setView(value);
              if (value === "preferences") void fetchUserPreferences();
            }}
          />

          {activeView !== "preferences" ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" type="button" onClick={() => resetFilters()}>
                Reset filters
              </Button>
              <div className="text-sm text-app-secondary">
                {notificationItems.length} visible notification{notificationItems.length === 1 ? "" : "s"}
              </div>
            </div>
          ) : null}
        </div>

        {activeView !== "preferences" ? (
          <div className="grid gap-3 lg:grid-cols-4">
            <SearchInput
              placeholder="Search notifications"
              value={filters.search}
              onChange={(event) => setFilters({ search: event.target.value })}
            />
            <Select
              value={filters.status}
              onChange={(event) => setFilters({ status: event.target.value as NotificationStatus })}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select
              value={filters.channel}
              onChange={(event) => setFilters({ channel: event.target.value as NotificationChannel })}
            >
              {channelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select
              value={filters.eventCode}
              onChange={(event) => setFilters({ eventCode: event.target.value as string })}
            >
              {eventOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        ) : null}
      </section>

      {activeView === "inbox" && (
        <section className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => void markAllAsRead()}
            >
              Mark all read
            </Button>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => void markAsArchived(notifications.map((item) => item.id))}
            >
              Archive all
            </Button>
          </div>
          <p className="text-sm text-app-secondary">Group by event code for faster review</p>
        </section>
      )}

      {error && (
        <Card className="rounded-3xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-900 dark:bg-rose-950/20">
          <p className="text-sm font-medium text-rose-700 dark:text-rose-300">{error}</p>
        </Card>
      )}

      {(isLoadingNotifications || isLoadingSummary) && (
        <Card className="rounded-3xl p-5">
          <p>Loading notifications...</p>
        </Card>
      )}

      {(activeView === "inbox" || activeView === "archived") ? (
        <NotificationsTable
          notifications={notificationItems}
          isLoading={isLoadingNotifications}
          onSelect={(notificationId) => {
            selectNotificationDetail(notificationId);
            navigate(appRoutes.notifications);
          }}
          onAction={handleAction}
          groupByEvent
        />
      ) : (
        <Card className="rounded-3xl p-5">
          <NotificationsPreferencesPanel preferences={preferences} />
        </Card>
      )}

      <NotificationDetailDrawer
        open={showDetailDrawer}
        notification={selectedNotificationDetail}
        onClose={closeDetailDrawer}
        onMarkRead={async (id) => {
          await markAsRead(id);
        }}
        onArchive={async (id) => {
          await markAsArchived(id);
        }}
        onAction={handleAction}
      />
    </div>
  );
}
