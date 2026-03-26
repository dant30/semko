import type { NotificationRecord } from "@/features/notifications/types/notification";

interface NotificationsTableProps {
  notifications: NotificationRecord[];
  isLoading: boolean;
  onSelect: (id: number) => void;
}

export function NotificationsTable({ notifications, isLoading, onSelect }: NotificationsTableProps) {
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

  return (
    <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-soft dark:border-slate-800 dark:bg-slate-950/65">
      <table className="w-full text-left">
        <thead className="bg-surface-border text-xs uppercase tracking-wide text-app-muted">
          <tr>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Event</th>
            <th className="px-4 py-3">Message</th>
            <th className="px-4 py-3">Channel</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {notifications.map((item) => (
            <tr key={item.id} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900" onClick={() => onSelect(item.id)}>
              <td className="px-4 py-3 font-semibold">{item.id}</td>
              <td className="px-4 py-3">{item.event_code}</td>
              <td className="px-4 py-3 line-clamp-2">{item.message || item.title}</td>
              <td className="px-4 py-3 capitalize">{item.channel}</td>
              <td className="px-4 py-3">{item.status}</td>
              <td className="px-4 py-3">{new Date(item.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
