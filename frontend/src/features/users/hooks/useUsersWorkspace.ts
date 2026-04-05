// frontend/src/features/users/hooks/useUsersWorkspace.ts
import { useCallback, useEffect, useMemo, useState } from "react";

import { useNotifications } from "@/core/contexts/useNotifications";
import { useAppDispatch, useAppSelector } from "@/core/store/hooks";
import { usersApi, createInitialUserFormValues, buildUserSummaryMetrics } from "@/features/users/services/users.api";
import { setUsersFilters } from "@/features/users/store/users.slice";
import type { RoleRecord, UserFormValues, UserRecord, UserFilters, UserSummaryMetrics } from "@/features/users/types/user";


export function useUsersWorkspace() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.users);
  const { showToast } = useNotifications();

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [userForm, setUserForm] = useState<UserFormValues>(createInitialUserFormValues);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserDetail, setSelectedUserDetail] = useState<UserRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoadingUserDetail, setIsLoadingUserDetail] = useState(false);
  const [lastAction, setLastAction] = useState<{
    type: "deactivate" | "activate" | "update";
    user: UserRecord;
  } | null>(null);

  const summary = useMemo<UserSummaryMetrics>(() => buildUserSummaryMetrics(users), [users]);

  const loadRoles = useCallback(async () => {
    try {
      const rolesData = await usersApi.fetchRoles();
      setRoles(rolesData);
    } catch (err) {
      console.error("Failed to load user roles", err);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const usersData = await usersApi.fetchUsers(filters);
      setUsers(usersData);
      setSelectedUserId((current) => (current ?? (usersData.length > 0 ? usersData[0].id : null)));
    } catch (err) {
      console.error("Failed to load users", err);
      setError("We could not load users at this time.");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    let active = true;

    (async () => {
      if (!active) return;
      await loadRoles();
    })();

    return () => {
      active = false;
    };
  }, [loadRoles]);

  useEffect(() => {
    let active = true;

    (async () => {
      if (!active) return;
      await loadUsers();
    })();

    return () => {
      active = false;
    };
  }, [loadUsers]);

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
      .catch((err) => {
        console.error("Failed to load selected user detail", err);
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
    await loadUsers();
  }

  function startEditUser(user: UserRecord) {
    setEditingUserId(user.id);
    setUserForm({
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number || "",
      role_id: user.role?.id ?? "",
      password: "",
      password_confirm: "",
      is_active: user.is_active,
      is_staff: user.is_staff,
      must_change_password: user.must_change_password,
    });
  }

  function cancelEdit() {
    setEditingUserId(null);
    setUserForm(createInitialUserFormValues());
  }

  async function submitUser() {
    setIsSubmitting(true);
    setError("");

    try {
      if (editingUserId !== null) {
        const payload: Partial<UserFormValues> = {
          ...userForm,
          role_id: userForm.role_id || undefined,
        };

        if (!payload.password) {
          delete payload.password;
          delete payload.password_confirm;
        }

        await usersApi.updateUser(editingUserId, payload);
        setLastAction({ type: "update", user: { ...users.find((u) => u.id === editingUserId)! } });
        showToast({
          title: "User updated",
          message: "User profile has been updated.",
          tone: "success",
        });
      } else {
        await usersApi.createUser(userForm);
        showToast({
          title: "User created",
          message: "New user has been created successfully.",
          tone: "success",
        });
      }

      setEditingUserId(null);
      setUserForm(createInitialUserFormValues());
      await refreshAll();
    } catch {
      const message = editingUserId ? "Could not update the user." : "Could not save the user. Please verify all fields and try again.";
      setError(message);
      showToast({
        title: editingUserId ? "User update failed" : "User save failed",
        message,
        tone: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function setActiveStateForUser(id: number, active: boolean) {
    setIsLoading(true);
    setError("");

    try {
      await usersApi.updateUser(id, { is_active: active });
      setLastAction({ type: active ? "activate" : "deactivate", user: users.find((u) => u.id === id)! });
      await refreshAll();
      showToast({
        title: active ? "User activated" : "User deactivated",
        message: active ? "User has been activated." : "User has been deactivated.",
        tone: "success",
      });
    } catch {
      const message = active ? "Could not activate the user." : "Could not deactivate the user.";
      setError(message);
      showToast({
        title: active ? "Activation failed" : "Deactivation failed",
        message,
        tone: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function undoLastAction() {
    if (!lastAction) return;

    try {
      if (lastAction.type === "deactivate") {
        await usersApi.updateUser(lastAction.user.id, { is_active: true });
        showToast({ title: "Undo successful", message: "User has been restored.", tone: "success" });
      } else if (lastAction.type === "activate") {
        await usersApi.updateUser(lastAction.user.id, { is_active: false });
        showToast({ title: "Undo successful", message: "User has been reverted to inactive.", tone: "success" });
      } else if (lastAction.type === "update") {
        await usersApi.updateUser(lastAction.user.id, {
          username: lastAction.user.username,
          email: lastAction.user.email,
          first_name: lastAction.user.first_name,
          last_name: lastAction.user.last_name,
          phone_number: lastAction.user.phone_number ?? "",
          role_id: lastAction.user.role?.id || undefined,
          is_active: lastAction.user.is_active,
          is_staff: lastAction.user.is_staff,
          must_change_password: lastAction.user.must_change_password,
        });
        showToast({ title: "Undo successful", message: "User update has been reversed.", tone: "success" });
      }
      setLastAction(null);
      await refreshAll();
    } catch {
      showToast({ title: "Undo failed", message: "Could not undo the last action.", tone: "danger" });
    }
  }

  return {
    users,
    roles,
    error,
    filters,
    isLoading,
    isSubmitting,
    userForm,
    editingUserId,
    selectedUserId,
    selectedUserDetail,
    isDrawerOpen,
    isLoadingUserDetail,
    lastAction,
    summary,
    refreshAll,
    setUserForm,
    setFilters: (payload: Partial<UserFilters>) => dispatch(setUsersFilters(payload)),
    submitUser,
    deactivateUser: (id: number) => setActiveStateForUser(id, false),
    activateUser: (id: number) => setActiveStateForUser(id, true),
    startEditUser,
    cancelEdit,
    selectUser: (id: number | null) => setSelectedUserId(id),
    openDrawer: () => setIsDrawerOpen(true),
    closeDrawer: () => setIsDrawerOpen(false),
    undoLastAction,
  };
}
