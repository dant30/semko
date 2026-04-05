// frontend/src/features/users/components/UserDetailContent.tsx
import {
  Mail,
  Phone,
  Shield,
  User,
  UserCheck,
  UserX,
} from "lucide-react";

import type { UserRecord } from "@/features/users/types/user";
import { Badge, Button, Skeleton } from "@/shared/components/ui";
import { EmptyState } from "@/shared/components/feedback/EmptyState";
import { formatDate } from "@/shared/utils/dates";

interface UserDetailContentProps {
  canManageUsers?: boolean;
  error?: string;
  isLoading?: boolean;
  onStatusChange: (active: boolean) => void;
  user: UserRecord | null;
}

export function UserDetailContent({
  canManageUsers = false,
  error,
  isLoading = false,
  onStatusChange,
  user,
}: UserDetailContentProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton />
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        description={error}
        title="Error loading user"
      />
    );
  }

  if (!user) {
    return (
      <EmptyState
        description="Select a user in the register to load their detail view."
        title="No user detail available"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <Badge variant="accent">User Account</Badge>
          <p className="text-sm text-app-secondary">
            {user.username} • {user.role?.name || "No role assigned"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canManageUsers ? (
            user.is_active ? (
              <Button
                onClick={() => onStatusChange(false)}
                size="sm"
                type="button"
                variant="danger"
              >
                <UserX className="h-4 w-4" />
                Deactivate
              </Button>
            ) : (
              <Button
                onClick={() => onStatusChange(true)}
                size="sm"
                type="button"
                variant="primary"
              >
                <UserCheck className="h-4 w-4" />
                Activate
              </Button>
            )
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/20">
              <User className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <p className="font-medium">{user.first_name} {user.last_name}</p>
              <p className="text-sm text-app-secondary">Full name</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">{user.email}</p>
              <p className="text-sm text-app-secondary">Email address</p>
            </div>
          </div>

          {user.phone_number && (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <Phone className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">{user.phone_number}</p>
                <p className="text-sm text-app-secondary">Phone number</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
              <Shield className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium">{user.role?.name || "No role assigned"}</p>
              <p className="text-sm text-app-secondary">Role</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
              user.is_active
                ? "bg-green-100 dark:bg-green-900/20"
                : "bg-red-100 dark:bg-red-900/20"
            }`}>
              {user.is_active ? (
                <UserCheck className="h-5 w-5 text-green-600" />
              ) : (
                <UserX className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div>
              <p className="font-medium">{user.is_active ? "Active" : "Inactive"}</p>
              <p className="text-sm text-app-secondary">Account status</p>
            </div>
          </div>

          {user.is_staff && (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                <Shield className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium">Staff/Admin</p>
                <p className="text-sm text-app-secondary">Administrative access</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-surface-border bg-white/70 p-4 dark:bg-slate-900/70">
        <h4 className="font-medium">Account Information</h4>
        <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
          <div>
            <span className="text-app-secondary">Username:</span> {user.username}
          </div>
          <div>
            <span className="text-app-secondary">User ID:</span> {user.id}
          </div>
          <div>
            <span className="text-app-secondary">Created:</span>{' '}
            {(() => {
              const primaryCreatedDate = formatDate(user.date_joined);
              if (primaryCreatedDate !== 'Invalid date') {
                return primaryCreatedDate;
              }

              const fallbackCreatedDate = formatDate(user.created_at);
              return fallbackCreatedDate === 'Invalid date' ? 'Unknown' : fallbackCreatedDate;
            })()}
          </div>
          <div>
            <span className="text-app-secondary">Last login:</span>{' '}
            {user.last_login ? formatDate(user.last_login) : 'Never'}
          </div>
        </div>
      </div>
    </div>
  );
}