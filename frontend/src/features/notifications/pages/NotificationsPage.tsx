import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { appRoutes } from "@/core/constants/routes";
import { useNotificationsWorkspace } from "@/features/notifications/hooks";
import type { NotificationRecord } from "@/features/notifications/types/notification";
import { NotificationsSummaryCards } from "@/features/notifications/components/NotificationsSummaryCards";
import { NotificationsViewTabs } from "@/features/notifications/components/NotificationsViewTabs";
import { NotificationsTable } from "@/features/notifications/components/NotificationsTable";
import { NotificationsPreferencesPanel } from "@/features/notifications/components/NotificationsPreferencesPanel";
import { Card } from "@/shared/components/ui/Card";
import { PageHeading } from "@/shared/components/ui/PageHeading";

export function NotificationsPage() {
  const navigate = useNavigate();
  const {
    notifications,
    summary,
    isLoadingNotifications,
    isLoadingSummary,
    error,
    viewType,
    setView,
    selectNotificationDetail,
    markAllAsRead,
    markAsArchived,
    preferences,
    fetchUserPreferences,
  } = useNotificationsWorkspace();

  const activeView = viewType || "inbox";

  const notificationItems = useMemo<NotificationRecord[]>(() => {
    if (activeView === "archived") return notifications.filter((n) => n.status === "archived");
    if (activeView === "inbox") return notifications.filter((n) => n.status !== "archived");
    return notifications;
  }, [activeView, notifications]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
      <PageHeading>Notifications</PageHeading>

      <section className="space-y-4">
        <NotificationsSummaryCards summary={summary} isLoading={isLoadingSummary} />
      </section>

      <section className="flex items-center justify-between gap-3">
        <NotificationsViewTabs
          viewType={activeView}
          onChange={(value) => {
            setView(value);
            if (value === "preferences") void fetchUserPreferences();
          }}
        />

        {activeView === "inbox" && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              onClick={() => void markAllAsRead()}
            >
              Mark all read
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
              onClick={() => void markAsArchived(notifications.map((item) => item.id))}
            >
              Archive all
            </button>
          </div>
        )}
      </section>

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
        />
      ) : (
        <Card className="rounded-3xl p-5">
          <NotificationsPreferencesPanel preferences={preferences} />
        </Card>
      )}
    </div>
  );
}
