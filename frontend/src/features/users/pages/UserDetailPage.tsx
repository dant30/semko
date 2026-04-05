// frontend/src/features/users/pages/UserDetailPage.tsx
import { ArrowLeft, Edit } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAppSelector } from "@/core/store/hooks";
import { getUserPermissions, hasAnyPermission } from "@/core/auth/permission-utils";
import { permissions } from "@/core/constants/permissions";
import { appRoutes } from "@/core/constants/routes";
import { useNotifications } from "@/core/contexts/useNotifications";
import { UserDetailContent } from "@/features/users/components/UserDetailContent";
import { usersApi } from "@/features/users/services/users.api";
import type { UserRecord } from "@/features/users/types/user";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

export function UserDetailPage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { showToast } = useNotifications();
  const parsedUserId = Number(userId);
  const authUser = useAppSelector((state) => state.auth.user);
  const canManageUsers = hasAnyPermission(
    getUserPermissions(authUser),
    [permissions.manageUsers]
  );

  const [user, setUser] = useState<UserRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!Number.isFinite(parsedUserId)) {
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);
    setError("");

    usersApi
      .fetchUser(parsedUserId)
      .then((userData) => {
        if (!active) return;
        setUser(userData);
      })
      .catch(() => {
        if (active) {
          setError("We could not load this user at this time.");
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [parsedUserId]);

  async function handleStatusChange(active: boolean) {
    if (!user) return;

    try {
      await usersApi.updateUser(user.id, { is_active: active });
      const updatedUser = { ...user, is_active: active };
      setUser(updatedUser);
      showToast({
        message: `User has been ${active ? "activated" : "deactivated"}.`,
        title: active ? "User activated" : "User deactivated",
        tone: "success",
      });
    } catch {
      showToast({
        message: "Could not update user status.",
        title: "Update failed",
        tone: "danger",
      });
    }
  }

  if (!Number.isFinite(parsedUserId)) {
    return (
      <Card className="rounded-[2rem] p-6">
        <p className="text-sm text-app-secondary">This user detail route is not valid.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-app-muted">
            User management
          </p>
          <h1>{user ? `${user.first_name} ${user.last_name}` : "User detail"}</h1>
          <p className="text-app-secondary">
            Review user account details and manage access permissions from a dedicated detail page.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => navigate(appRoutes.users)} type="button" variant="ghost">
            <ArrowLeft className="h-4 w-4" />
            Back to users
          </Button>
          {user && canManageUsers ? (
            <Button
              onClick={() => navigate(appRoutes.userEdit(user.id))}
              type="button"
              variant="secondary"
            >
              <Edit className="h-4 w-4" />
              Edit user
            </Button>
          ) : null}
        </div>
      </div>

      <Card className="rounded-[2rem] p-6">
        <UserDetailContent
          canManageUsers={canManageUsers}
          error={error}
          isLoading={isLoading}
          onStatusChange={handleStatusChange}
          user={user}
        />
      </Card>
    </div>
  );
}