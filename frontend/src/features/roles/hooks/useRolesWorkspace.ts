import { useEffect, useState } from "react";

import { useNotifications } from "@/core/contexts/useNotifications";
import { useAppDispatch, useAppSelector } from "@/core/store/hooks";
import { rolesApi, createInitialRoleFormValues } from "@/features/roles/services/roles.api";
import { setRolesFilters } from "@/features/roles/store/roles.slice";
import type { RoleFormValues, RoleRecord, RoleFilters } from "@/features/roles/types/role";

export function useRolesWorkspace() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.roles);
  const { showToast } = useNotifications();

  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [roleForm, setRoleForm] = useState<RoleFormValues>(createInitialRoleFormValues);
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError("");

    rolesApi
      .fetchRoles(filters.search)
      .then((rolesData) => {
        if (!active) return;
        setRoles(rolesData);
      })
      .catch(() => {
        if (active) {
          setError("Could not load roles at this time.");
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
  }, [filters]);

  async function refreshAll() {
    setIsLoading(true);
    setError("");

    try {
      const rolesData = await rolesApi.fetchRoles(filters.search);
      setRoles(rolesData);
    } catch {
      setError("Could not refresh roles.");
    } finally {
      setIsLoading(false);
    }
  }

  function startEditRole(role: RoleRecord) {
    setEditingRoleId(role.id);
    setRoleForm({
      name: role.name,
      code: role.code,
      description: role.description || "",
      permissions: role.permissions.join(", "),
    });
  }

  function cancelEditRole() {
    setEditingRoleId(null);
    setRoleForm(createInitialRoleFormValues());
  }

  async function submitRole() {
    setIsSubmitting(true);
    setError("");

    try {
      if (editingRoleId !== null) {
        await rolesApi.updateRole(editingRoleId, roleForm);
        showToast({ title: "Role updated", message: "Role was updated successfully.", tone: "success" });
      } else {
        await rolesApi.createRole(roleForm);
        showToast({ title: "Role created", message: "Role was created successfully.", tone: "success" });
      }

      setEditingRoleId(null);
      setRoleForm(createInitialRoleFormValues());
      await refreshAll();
    } catch {
      const message = editingRoleId ? "Could not update role." : "Could not create role.";
      setError(message);
      showToast({ title: "Role save failed", message, tone: "danger" });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteRole(id: number) {
    setIsLoading(true);
    setError("");

    try {
      await rolesApi.deleteRole(id);
      showToast({ title: "Role deleted", message: "Role has been deleted.", tone: "success" });
      await refreshAll();
    } catch {
      setError("Could not delete role.");
      showToast({ title: "Delete failed", message: "Could not delete role.", tone: "danger" });
    } finally {
      setIsLoading(false);
    }
  }

  return {
    roles,
    error,
    filters,
    isLoading,
    isSubmitting,
    roleForm,
    editingRoleId,
    refreshAll,
    setRoleForm,
    startEditRole,
    cancelEditRole,
    submitRole,
    deleteRole,
    setFilters: (payload: Partial<RoleFilters>) => dispatch(setRolesFilters(payload)),
  };
}
