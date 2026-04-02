import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Inbox } from "lucide-react";

import { Badge, Dropdown, DropdownItem, IconButton } from "@/shared/components/ui";
import { appRoutes } from "@/core/constants/routes";
import { notificationsApi } from "@/features/notifications/services/notifications.api";
import type { NotificationRecord } from "@/features/notifications/types/notification";

const MAX_VISIBLE_NOTIFICATIONS = 5;

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const navigate = useNavigate();

  const unreadCount = useMemo(
    () => notifications.filter((notification) => notification.status !== "read").length,
    [notifications]
  );

  useEffect(() => {
    let active = true;

    notificationsApi
      .fetchInbox()
      .then((response) => {
        const items = Array.isArray(response) ? response : response.results ?? [];
        if (active) {
          setNotifications(items.slice(0, MAX_VISIBLE_NOTIFICATIONS));
        }
      })
      .catch(() => {
        if (active) {
          setNotifications([]);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <Dropdown
      trigger={
        <IconButton
          aria-label={`Notifications (${unreadCount} unread)`}
          icon={<Bell className="h-5 w-5" />}
          variant="ghost"
          size="sm"
          className="relative"
        >
          {unreadCount > 0 && (
            <span className="absolute right-0 top-0 inline-flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
            </span>
          )}
        </IconButton>
      }
      align="right"
      className="w-96 max-w-[calc(100vw-1.5rem)]"
    >
      <div className="rounded-2xl border border-surface-border bg-white shadow-hard dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-app-primary">Notifications</p>
            <p className="text-xs text-app-muted">Recent updates from your workspace</p>
          </div>
          {unreadCount > 0 ? (
            <Badge variant="accent" size="xs">{unreadCount} new</Badge>
          ) : (
            <Badge variant="neutral" size="xs">No new alerts</Badge>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownItem
                key={notification.id}
                onClick={() => navigate(appRoutes.notifications)}
                className="flex items-start gap-3 px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <div className="mt-1 shrink-0 rounded-lg bg-accent-100 p-2 text-accent-700 dark:bg-accent-900 dark:text-accent-200">
                  <Inbox className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-semibold text-app-primary">
                    {notification.title || "Notification"}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-app-secondary">
                    {notification.message || "You have a new update."}
                  </p>
                  {notification.created_at && (
                    <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-app-muted">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  )}
                </div>
                {notification.status !== "read" && (
                  <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-accent-500" />
                )}
              </DropdownItem>
            ))
          ) : (
            <div className="p-6 text-center text-sm text-app-secondary">
              <p>No notifications yet</p>
              <p className="mt-1 text-xs text-app-muted">You are all caught up.</p>
            </div>
          )}
        </div>
      </div>
    </Dropdown>
  );
}
