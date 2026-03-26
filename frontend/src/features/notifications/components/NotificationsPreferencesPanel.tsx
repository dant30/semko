import type { NotificationPreference } from "@/features/notifications/types/notification";

interface NotificationsPreferencesPanelProps {
  preferences: NotificationPreference[];
}

export function NotificationsPreferencesPanel({ preferences }: NotificationsPreferencesPanelProps) {
  if (preferences.length === 0) {
    return <p className="text-app-secondary">No notification preferences are configured.</p>;
  }

  return (
    <div className="space-y-3">
      {preferences.map((pref) => (
        <div key={pref.id} className="rounded-xl border border-surface-border p-4">
          <p className="font-semibold">{pref.event_code}</p>
          <p className="text-xs text-app-muted">Channels: {pref.channels.join(", ")}</p>
          <p className="text-xs text-app-muted">Enabled: {pref.enabled ? "Yes" : "No"}</p>
        </div>
      ))}
    </div>
  );
}
