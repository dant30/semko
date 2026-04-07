import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useNotifications } from "@/core/contexts/useNotifications";
import { appRoutes } from "@/core/constants/routes";
import { clientsApi, createInitialClientFormValues } from "@/features/clients/services/clients.api";
import type { ClientFormValues } from "@/features/clients/types/client";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateClientForm(values: ClientFormValues) {
  const errors: Partial<Record<keyof ClientFormValues, string>> = {};

  if (!values.name.trim()) {
    errors.name = "Client name is required.";
  }

  if (!values.code.trim()) {
    errors.code = "Client code is required.";
  }

  if (!values.client_type) {
    errors.client_type = "Client type is required.";
  }

  if (values.email && !isValidEmail(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.status) {
    errors.status = "Client status is required.";
  }

  return errors;
}

function hasFormChanges(current: ClientFormValues, initial: ClientFormValues) {
  return JSON.stringify(current) !== JSON.stringify(initial);
}

export function useClientForm(clientId?: number) {
  const navigate = useNavigate();
  const { showToast } = useNotifications();
  const [formValues, setFormValues] = useState<ClientFormValues>(createInitialClientFormValues);
  const [initialValues, setInitialValues] = useState<ClientFormValues>(createInitialClientFormValues);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ClientFormValues, string>>>({});

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError("");

    const loadClient = async () => {
      try {
        if (clientId) {
          const client = await clientsApi.fetchClient(clientId);
          if (!active) return;

          const values: ClientFormValues = {
            name: client.name,
            code: client.code,
            client_type: client.client_type,
            contact_person: client.contact_person || "",
            phone_number: client.phone_number || "",
            alternate_phone_number: client.alternate_phone_number || "",
            email: client.email || "",
            address: client.address || "",
            town: client.town || "",
            county: client.county || "",
            status: client.status,
            notes: client.notes || "",
            is_active: client.is_active,
          };

          setFormValues(values);
          setInitialValues(values);
        } else {
          const initial = createInitialClientFormValues();
          setFormValues(initial);
          setInitialValues(initial);
        }
      } catch {
        if (active) {
          setError("We could not load the client details.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadClient();

    return () => {
      active = false;
    };
  }, [clientId]);

  function updateField<K extends keyof ClientFormValues>(field: K, value: ClientFormValues[K]) {
    setFormValues((current) => ({ ...current, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((current) => ({ ...current, [field]: undefined }));
    }
  }

  function confirmDiscardChanges() {
    if (!hasFormChanges(formValues, initialValues)) {
      return true;
    }

    return window.confirm("You have unsaved changes. Are you sure you want to leave?");
  }

  async function submit() {
    setIsSubmitting(true);
    setError("");
    setFieldErrors({});

    const validationErrors = validateClientForm(formValues);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setError("Please correct the highlighted fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      if (clientId) {
        await clientsApi.updateClient(clientId, formValues);
        showToast({ title: "Client updated", message: "Client profile has been updated.", tone: "success" });
      } else {
        await clientsApi.createClient(formValues);
        showToast({ title: "Client created", message: "New client has been added.", tone: "success" });
      }
      navigate(appRoutes.clients);
    } catch (err: unknown) {
      const responseData = (err as { response?: { data?: unknown } })?.response?.data;
      if (responseData && typeof responseData === "object") {
        const nextFieldErrors: Partial<Record<keyof ClientFormValues, string>> = {};
        for (const [key, value] of Object.entries(responseData)) {
          if (key in formValues) {
            nextFieldErrors[key as keyof ClientFormValues] = Array.isArray(value)
              ? String(value[0])
              : String(value);
          }
        }
        setFieldErrors(nextFieldErrors);
        setError("Please correct the errors below.");
      } else {
        setError(clientId ? "Unable to save client changes." : "Unable to create client.");
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
    submit,
    updateField,
  } as const;
}
