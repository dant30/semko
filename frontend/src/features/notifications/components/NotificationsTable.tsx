import { Fragment } from "react";
import type { NotificationRecord } from "@/features/notifications/types/notification";

interface NotificationsTableProps {
  notifications: NotificationRecord[];
  isLoading: boolean;
  onSelect: (id: number) => void;
  onAction?: (notification: NotificationRecord) => void;
  groupByEvent?: boolean;
}

function formatPriority(priority?: string | null) {
  switch (priority) {
    case "critical":
      return "Critical";
    case "high":
      return "High";
    case "medium":
      return "Medium";
    case "low":
      return "Low";
    default:
      return "Normal";
  }
}

export function NotificationsTable({
  notifications,
  isLoading,
  onSelect,
  onAction,
  groupByEvent = true,
}: NotificationsTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-3xl border border-white/70 bg-white/80 p-8 text-center text-app-secondary dark:border-slate-800 dark:bg-slate-950/65">
        Loading notifications...
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-app-muted p-8 text-center text-app-muted">
        No notifications to display.
      </div>
    );
  }

  const groupedNotifications = groupByEvent
    ? Object.entries(
        notifications.reduce<Record<string, NotificationRecord[]>>((groups, notification) => {
          const key = notification.event_code || "Other";
          if (!groups[key]) {
            groups[key] = [];
          }
          groups[key].push(notification);
          return groups;
        }, {})
      ).sort((a, b) => b[1].length - a[1].length)
    : [["All notifications", notifications]] as [string, NotificationRecord[]][];

  return (
    <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-soft dark:border-slate-800 dark:bg-slate-950/65">
      <table className="w-full text-left">
        <thead className="bg-surface-border text-xs uppercase tracking-wide text-app-muted">
          <tr>
            <th className="px-4 py-3">Event</th>
            <th className="px-4 py-3">Message</th>
            <th className="px-4 py-3">Channel</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {groupedNotifications.map(([eventCode, group]) => (
            <Fragment key={`group-${eventCode}`}>
              <tr
                className="border-t border-slate-200 bg-slate-50 text-sm uppercase tracking-[0.18em] text-app-muted dark:border-slate-800 dark:bg-slate-900"
              >
                <td className="px-4 py-3 font-semibold" colSpan={7}>
                  {eventCode} ({group.length})
                </td>
              </tr>
              {group.map((item) => {
                const priority = item.priority || item.metadata?.priority;
                const hasAction = Boolean(item.metadata?.action_url || item.metadata?.action_type);

                return (
                  <tr
                    key={item.id}
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900"
                    onClick={() => onSelect(item.id)}
                  >
                    <td className="px-4 py-3 font-semibold">{item.event_code}</td>
                    <td className="px-4 py-3 line-clamp-2">{item.message || item.title}</td>
                    <td className="px-4 py-3 capitalize">{item.channel}</td>
                    <td className="px-4 py-3">{item.status}</td>
                    <td className="px-4 py-3">{formatPriority(priority)}</td>
                    <td className="px-4 py-3">{new Date(item.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {hasAction ? (
                        <button
                          type="button"
                          className="text-app-primary hover:underline"
                          onClick={(event) => {
                            event.stopPropagation();
                            if (onAction) {
                              onAction(item);
                            } else if (item.metadata?.action_url) {
                              window.open(item.metadata.action_url, "_blank", "noopener noreferrer");
                            }
                          }}
                        >
                          {item.metadata?.action_type || "Open"}
                        </button>
                      ) : (
                        <span className="text-app-muted">No action</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
