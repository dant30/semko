import { ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { appRoutes } from "@/core/constants/routes";
import type { UserRecord } from "@/features/users/types/user";
import { Badge, Button, Card, EmptyBlock, Skeleton } from "@/shared/components/ui";

interface UserDetailPanelProps {
  canManageUsers?: boolean;
  isLoading?: boolean;
  onOpenDetail?: () => void;
  onEditUser?: () => void;
  onViewUser?: () => void;
  selectedUser: UserRecord | null;
}

export function UserDetailPanel({
  canManageUsers = false,
  isLoading = false,
  onOpenDetail,
  onEditUser,
  onViewUser,
  selectedUser,
}: UserDetailPanelProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className="rounded-[2rem] p-6">
        <div className="space-y-4">
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      </Card>
    );
  }

  if (!selectedUser) {
    return (
      <Card className="rounded-[2rem] p-6">
        <EmptyBlock
          title="No user selected"
          description="Select a user from the table to view user summary and workflow actions."
        />
      </Card>
    );
  }

  return (
    <Card className="rounded-[2rem] p-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Badge variant="accent">User summary</Badge>
          <div>
            <h3 className="text-xl">{selectedUser.username}</h3>
            <p className="mt-1 text-sm text-app-secondary">{selectedUser.email}</p>
          </div>

          <div className="grid gap-2">
            <p>
              <strong>Name:</strong> {selectedUser.first_name} {selectedUser.last_name}
            </p>
            <p>
              <strong>Role:</strong> {selectedUser.role?.name || "Unassigned"}
            </p>
            <p>
              <strong>Status:</strong> {selectedUser.is_active ? "Active" : "Inactive"}
            </p>
            <p>
              <strong>Staff:</strong> {selectedUser.is_staff ? "Yes" : "No"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {onViewUser ? (
              <Button type="button" variant="outline" onClick={onViewUser}>
                View details
              </Button>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                onOpenDetail?.();
              }}
            >
              <ExternalLink className="h-4 w-4" />
              Open full detail
            </Button>
            {canManageUsers ? (
              <Button type="button" variant="secondary" onClick={onEditUser}>
                Edit user
              </Button>
            ) : null}
            <Button type="button" variant="ghost" onClick={() => navigate(appRoutes.users)}>
              Refresh list
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
