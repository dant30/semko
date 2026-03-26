import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useNotifications } from "@/core/contexts/useNotifications";
import { appRoutes } from "@/core/constants/routes";
import { usersApi, createInitialUserFormValues } from "@/features/users/services/users.api";
import type { RoleRecord, UserFormValues } from "@/features/users/types/user";

export function useUserForm(userId?: number) {
  const navigate = useNavigate();
  const { showToast } = useNotifications();
  const [formValues, setFormValues] = useState<UserFormValues>(createInitialUserFormValues);
  const [initialValues, setInitialValues] = useState<UserFormValues>(createInitialUserFormValues);
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof UserFormValues, string>>>({});

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError("");

    Promise.all([
      usersApi.fetchRoles(),
      userId ? usersApi.fetchUser(userId) : Promise.resolve(null),
    ])
      .then(([rolesData, userData]) => {
        if (!active) return;
        setRoles(rolesData);

        if (userData) {
          const formData = {
            username: userData.username,
            email: userData.email,
            first_name: userData.first_name,
            last_name: userData.last_name,
            phone_number: userData.phone_number || "",
            role_id: userData.role?.id ?? "",
            password: "",
            password_confirm: "",
            is_active: userData.is_active,
            is_staff: userData.is_staff,
            must_change_password: userData.must_change_password,
          };
          setFormValues(formData);
          setInitialValues(formData);
        } else {
          const initial = createInitialUserFormValues();
          setFormValues(initial);
          setInitialValues(initial);
        }
      })
      .catch(() => {
        if (active) {
          setError("We could not load the form data.");
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
  }, [userId]);

  function updateField<K extends keyof UserFormValues>(field: K, value: UserFormValues[K]) {
    setFormValues((current) => ({ ...current, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((current) => ({ ...current, [field]: undefined }));
    }
  }

  function confirmDiscardChanges() {
    const hasChanges = JSON.stringify(formValues) !== JSON.stringify(initialValues);
    if (!hasChanges) return true;

    return window.confirm("You have unsaved changes. Are you sure you want to leave?");
  }

  async function submit() {
    setIsSubmitting(true);
    setError("");
    setFieldErrors({});

    try {
      if (userId) {
        const payload: Partial<UserFormValues> = {
          ...formValues,
          role_id: formValues.role_id || undefined,
        };

        if (!payload.password) {
          delete payload.password;
          delete payload.password_confirm;
        }

        await usersApi.updateUser(userId, payload);
        showToast({
          title: "User updated",
          message: "User profile has been updated successfully.",
          tone: "success",
        });
      } else {
        await usersApi.createUser(formValues);
        showToast({
          title: "User created",
          message: "New user has been created successfully.",
          tone: "success",
        });
      }

      navigate(appRoutes.users);
    } catch (err: any) {
      const errorData = err?.response?.data;
      if (errorData && typeof errorData === "object") {
        const newFieldErrors: Partial<Record<keyof UserFormValues, string>> = {};
        for (const [key, value] of Object.entries(errorData)) {
          if (key in formValues) {
            newFieldErrors[key as keyof UserFormValues] = Array.isArray(value) ? value[0] : String(value);
          }
        }
        setFieldErrors(newFieldErrors);
        setError("Please correct the errors below.");
      } else {
        setError(userId ? "Could not update the user." : "Could not create the user.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    confirmDiscardChanges,
    error,
    fieldErrors,
    formValues,
    isLoading,
    isSubmitting,
    roles,
    submit,
    updateField,
  };
}