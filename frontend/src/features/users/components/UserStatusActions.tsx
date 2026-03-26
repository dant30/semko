import { UserCheck, UserX } from "lucide-react";

import type { UserRecord } from "@/features/users/types/user";
import { Button } from "@/shared/components/ui/Button";

interface UserStatusActionsProps {
  canManageUsers?: boolean;
  onStatusChange: (active: boolean) => void;
  user: Pick<UserRecord, "is_active">;
}

export function UserStatusActions({
  canManageUsers = false,
  onStatusChange,
  user,
}: UserStatusActionsProps) {
  if (!canManageUsers) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {user.is_active ? (
        <Button
          onClick={() => onStatusChange(false)}
          size="sm"
          type="button"
          variant="danger"
        >
          <UserX className="h-4 w-4" />
          Deactivate user
        </Button>
      ) : (
        <Button
          onClick={() => onStatusChange(true)}
          size="sm"
          type="button"
          variant="primary"
        >
          <UserCheck className="h-4 w-4" />
          Activate user
        </Button>
      )}
    </div>
  );
}