// frontend/src/features/users/components/UserDetailDrawer.tsx
import type { UserRecord } from "@/features/users/types/user";
import { Badge, Button, Card, Drawer, Skeleton } from "@/shared/components/ui";

interface UserDetailDrawerProps {
  canManageUsers?: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onView?: () => void;
  open: boolean;
  selectedUser: UserRecord | null;
}

export function UserDetailDrawer({
  canManageUsers = false,
  isLoading = false,
  onClose,
  onEdit,
  onView,

  open,
  selectedUser,
}: UserDetailDrawerProps) {
  if (!open) {
    return null;
  }

  return (
    <Drawer
      title={selectedUser?.username || "User detail"}
      description="Inspect full user attributes and perform user workflow actions in one view."
      onClose={onClose}
      open={open}
    >
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      ) : selectedUser ? (
        <Card className="rounded-[2rem] p-6">
          <div className="space-y-4">
            <Badge variant={selectedUser.is_active ? "brand" : "accent"}>
              {selectedUser.is_active ? "Active" : "Inactive"}
            </Badge>
            <div className="grid gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">Username</p>
                <p className="text-sm text-app-primary">{selectedUser.username}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">Email</p>
                <p className="text-sm text-app-primary">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">Role</p>
                <p className="text-sm text-app-primary">{selectedUser.role?.name || "Unassigned"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">Name</p>
                <p className="text-sm text-app-primary">{selectedUser.first_name} {selectedUser.last_name}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">Phone</p>
                <p className="text-sm text-app-primary">{selectedUser.phone_number || "N/A"}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {canManageUsers ? (
                <Button type="button" variant="secondary" onClick={onEdit}>
                  Edit user
                </Button>
              ) : null}
              {onView ? (
                <Button type="button" variant="outline" onClick={onView}>
                  View full profile
                </Button>
              ) : null}
              <Button type="button" variant="ghost" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="rounded-[2rem] p-6">
          <p className="text-sm text-app-secondary">No user selected.</p>
        </Card>
      )}
    </Drawer>
  );
}
