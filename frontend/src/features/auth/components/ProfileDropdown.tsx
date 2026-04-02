import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Settings, Shield, User } from "lucide-react";

import { Dropdown, DropdownItem } from "@/shared/components/ui";
import { useAppDispatch, useAppSelector } from "@/core/store/hooks";
import { useAuthContext } from "@/features/auth/store/auth-context";
import { clearAuth } from "@/features/auth/store/auth.slice";
import { appRoutes } from "@/core/constants/routes";

export function ProfileDropdown() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { logout } = useAuthContext();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = useCallback(() => {
    logout();
    dispatch(clearAuth());
    navigate(appRoutes.login, { replace: true });
  }, [dispatch, logout, navigate]);

  const trigger = (
    <button
      type="button"
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-sm font-semibold text-white shadow-md">
        {user?.first_name?.charAt(0) || user?.username?.charAt(0) || "U"}
      </div>
      <ChevronDown className="hidden h-4 w-4 sm:block" />
    </button>
  );

  return (
    <Dropdown trigger={trigger} align="right" className="w-64">
      <div className="rounded-2xl border border-surface-border bg-white shadow-hard dark:bg-slate-900">
        <div className="border-b border-surface-border px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-sm font-semibold text-white">
              {user?.first_name?.charAt(0) || user?.username?.charAt(0) || "U"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-app-primary">
                {user?.first_name || user?.username || "SEMKO User"}
              </p>
              <p className="truncate text-xs text-app-muted">{user?.email || "No email available"}</p>
            </div>
          </div>
        </div>

        <div className="py-1">
          <DropdownItem
            onClick={() => navigate(appRoutes.profile)}
            className="flex items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <User className="h-4 w-4" />
            My profile
          </DropdownItem>
          <DropdownItem
            onClick={() => navigate(appRoutes.changePassword)}
            className="flex items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Shield className="h-4 w-4" />
            Change password
          </DropdownItem>
          <DropdownItem
            onClick={() => navigate(appRoutes.settings)}
            className="flex items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Settings className="h-4 w-4" />
            Settings
          </DropdownItem>
        </div>

        <div className="border-t border-surface-border py-1">
          <DropdownItem
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-left text-sm text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </DropdownItem>
        </div>
      </div>
    </Dropdown>
  );
}
