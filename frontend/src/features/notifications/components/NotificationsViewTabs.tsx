import { Button } from "@/shared/components/ui/Button";
import type { NotificationViewType } from "@/features/notifications/types/notification";

interface NotificationsViewTabsProps {
  viewType: NotificationViewType;
  onChange: (view: NotificationViewType) => void;
}

export function NotificationsViewTabs({ viewType, onChange }: NotificationsViewTabsProps) {
  const tabs: { value: NotificationViewType; label: string }[] = [
    { value: "inbox", label: "Inbox" },
    { value: "archived", label: "Archived" },
    { value: "preferences", label: "Preferences" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <Button
          key={tab.value}
          variant={viewType === tab.value ? "primary" : "ghost"}
          onClick={() => onChange(tab.value)}
          type="button"
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
}
