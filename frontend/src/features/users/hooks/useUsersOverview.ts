import { useEffect, useState } from "react";

import { useNotifications } from "@/core/contexts/useNotifications";
import { useAppDispatch, useAppSelector } from "@/core/store/hooks";
import { usersApi, buildUserSummaryMetrics } from "@/features/users/services/users.api";
import { setUsersFilters } from "@/features/users/store/users.slice";
import type { RoleRecord, UserRecord, UserFilters, UserSummaryMetrics } from "@/features/users/types/user";

const EMPTY_SUMMARY: UserSummaryMetrics = {
  totalUsers: 0,
  activeUsers: 0,
  inactiveUsers: 0,
  staffUsers: 0,
};

export function useUsersOverview() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.users);
  const { showToast } = useNotifications();

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [summary, setSummary] = useState<UserSummaryMetrics>(EMPTY_SUMMARY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserDetail, setSelectedUserDetail] = useState<UserRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoadingUserDetail, setIsLoadingUserDetail] = useState(false);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError("");

    Promise.all([usersApi.fetchUsers(filters), usersApi.fetchRoles()])
      .then(([usersData, rolesData]) => {
        if (!active) return;
        setUsers(usersData);
        setRoles(rolesData);
        setSummary(buildUserSummaryMetrics(usersData));
        if (!selectedUserId && usersData.length > 0) {
          setSelectedUserId(usersData[0].id);
        }
      })
      .catch(() => {
        if (active) {
          setError("We could not load users at this time.");
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
  }, [filters, selectedUserId]);

  useEffect(() => {
    if (!selectedUserId) {
      setSelectedUserDetail(null);
      return;
    }

    let active = true;
    setIsLoadingUserDetail(true);

    usersApi
      .fetchUser(selectedUserId)
      .then((userDetail) => {
        if (!active) return;
        setSelectedUserDetail(userDetail);
      })
      .catch(() => {
        if (active) {
          setSelectedUserDetail(null);
        }
      })
      .finally(() => {
        if (active) {
          setIsLoadingUserDetail(false);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedUserId]);

  async function refreshAll() {
    setIsLoading(true);
    setError("");

    try {
      const [usersData, rolesData] = await Promise.all([usersApi.fetchUsers(filters), usersApi.fetchRoles()]);
      setUsers(usersData);
      setRoles(rolesData);
      setSummary(buildUserSummaryMetrics(usersData));
    } catch {
      setError("We could not refresh the users data.");
    } finally {
      setIsLoading(false);
    }
  }

  return {
    users,
    roles,
    error,
    filters,
    isLoading,
    selectedUserId,
    selectedUserDetail,
    isDrawerOpen,
    isLoadingUserDetail,
    summary,
    refreshAll,
    setFilters: (payload: Partial<UserFilters>) => dispatch(setUsersFilters(payload)),
    selectUser: (id: number | null) => setSelectedUserId(id),
    openDrawer: () => setIsDrawerOpen(true),
    closeDrawer: () => setIsDrawerOpen(false),
  };
}