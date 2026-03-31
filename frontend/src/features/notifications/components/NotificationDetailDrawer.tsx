import { ExternalLink, Layers } from "lucide-react";
import type { NotificationRecord } from "@/features/notifications/types/notification";
import { Button } from "@/shared/components/ui/Button";
import { Drawer } from "@/shared/components/ui/Drawer";

interface NotificationDetailDrawerProps {
  open: boolean;
  notification: NotificationRecord | null;
  onClose: () => void;
  onMarkRead?: (id: number) => Promise<void>;
  onArchive?: (ids: number | number[]) => Promise<void>;
  onAction?: (notification: NotificationRecord) => void;
}

const priorityLabel = (priority?: string | null) => {
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
};

const priorityClasses = (priority?: string | null) => {
  switch (priority) {
    case "critical":
      return "bg-rose-100 text-rose-700";
    case "high":
      return "bg-amber-100 text-amber-700";
    case "medium":
      return "bg-sky-100 text-sky-700";
    case "low":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

export function NotificationDetailDrawer({
  open,
  notification,
  onClose,
  onMarkRead,
  onArchive,
  onAction,
}: NotificationDetailDrawerProps) {
  if (!notification) {
    return (
      <Drawer open={open} onClose={onClose} title="Notification details" description="Select a notification to view more information." />
    );
  }

  const actionUrl = notification.metadata?.action_url;
  const actionLabel = notification.metadata?.action_type
    ? `${notification.metadata.action_type}`
    : actionUrl
    ? "Open related item"
    : "";
  const priority = notification.priority || notification.metadata?.priority;

  return (
    <Drawer open={open} onClose={onClose} title="Notification details" description="See details, metadata, and actions for this notification.">
      <div className="space-y-6">
        <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-app-muted">{notification.event_code}</p>
              <h3 className="mt-3 text-xl font-semibold text-app-primary">{notification.title || notification.message}</h3>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityClasses(priority)}`}>
              {priorityLabel(priority)}
            </span>
          </div>
          <p className="text-sm leading-6 text-app-secondary">{notification.message}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-950">
              <p className="text-xs uppercase tracking-[0.24em] text-app-muted">Status</p>
              <p className="text-sm font-semibold">{notification.status}</p>
            </div>
            <div className="space-y-1 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-950">
              <p className="text-xs uppercase tracking-[0.24em] text-app-muted">Channel</p>
              <p className="text-sm font-semibold capitalize">{notification.channel.replace("_", " ")}</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-950">
              <p className="text-xs uppercase tracking-[0.24em] text-app-muted">Created</p>
              <p className="text-sm font-semibold">{new Date(notification.created_at).toLocaleString()}</p>
            </div>
            {notification.read_at ? (
              <div className="space-y-1 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-950">
                <p className="text-xs uppercase tracking-[0.24em] text-app-muted">Read</p>
                <p className="text-sm font-semibold">{new Date(notification.read_at).toLocaleString()}</p>
              </div>
            ) : null}
          </div>
        </div>

        {notification.metadata ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center gap-3 text-sm font-semibold text-app-primary">
              <Layers className="h-4 w-4" />
              <span>Metadata</span>
            </div>
            <div className="mt-4 grid gap-3 text-sm text-app-secondary">
              {notification.metadata.entity ? (
                <p>
                  <span className="font-semibold text-app-primary">Entity:</span> {notification.metadata.entity}
                </p>
              ) : null}
              {notification.metadata.entity_id ? (
                <p>
                  <span className="font-semibold text-app-primary">Entity ID:</span> {notification.metadata.entity_id}
                </p>
              ) : null}
              {notification.metadata.action_type ? (
                <p>
                  <span className="font-semibold text-app-primary">Action type:</span> {notification.metadata.action_type}
                </p>
              ) : null}
              {notification.metadata.action_url ? (
                <p className="break-all">
                  <span className="font-semibold text-app-primary">Action URL:</span> {notification.metadata.action_url}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          {notification.status !== "read" ? (
            <Button
              variant="secondary"
              onClick={async () => {
                if (onMarkRead) await onMarkRead(notification.id);
              }}
              type="button"
            >
              Mark as read
            </Button>
          ) : null}
          {notification.status !== "archived" ? (
            <Button
              variant="outline"
              onClick={async () => {
                if (onArchive) await onArchive(notification.id);
              }}
              type="button"
            >
              Archive
            </Button>
          ) : null}
          {actionUrl || notification.metadata?.action_type ? (
            <Button
              variant="primary"
              onClick={() => {
                if (onAction) {
                  onAction(notification);
                } else if (actionUrl) {
                  window.open(actionUrl, "_blank", "noopener noreferrer");
                }
              }}
              type="button"
              leftIcon={<ExternalLink className="h-4 w-4" />}
            >
              {actionLabel || "Take action"}
            </Button>
          ) : null}
        </div>
      </div>
    </Drawer>
  );
}
