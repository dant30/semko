import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useNotifications } from "@/core/contexts/useNotifications";
import { appRoutes } from "@/core/constants/routes";
import { driversApi, createInitialDriverFormValues } from "@/features/drivers/services/drivers.api";
import type { DriverFormValues } from "@/features/drivers/types/driver";

function validateDriverForm(values: DriverFormValues) {
  const errors: Partial<Record<string, string>> = {};

  if (!values.employee_id.trim()) {
    errors.employee_id = "Employee ID is required.";
  }

  if (!values.first_name.trim()) {
    errors.first_name = "Driver first name is required.";
  }

  if (!values.last_name.trim()) {
    errors.last_name = "Driver last name is required.";
  }

  if (!values.phone_number.trim()) {
    errors.phone_number = "Phone number is required.";
  }

  if (!values.license.license_number.trim()) {
    errors["license.license_number"] = "License number is required.";
  }

  if (!values.license.expiry_date.trim()) {
    errors["license.expiry_date"] = "License expiry date is required.";
  }

  return errors;
}

function hasFormChanges(current: DriverFormValues, initial: DriverFormValues) {
  return JSON.stringify(current) !== JSON.stringify(initial);
}

export function useDriverForm(driverId?: number) {
  const navigate = useNavigate();
  const { showToast } = useNotifications();
  const [formValues, setFormValues] = useState<DriverFormValues>(createInitialDriverFormValues);
  const [initialValues, setInitialValues] = useState<DriverFormValues>(createInitialDriverFormValues);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({});

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError("");

    const loadDriver = async () => {
      try {
        if (driverId) {
          const driverData = await driversApi.fetchDriver(driverId);
          if (!active) return;

          setFormValues({
            address: driverData.address,
            alternate_phone_number: driverData.alternate_phone_number,
            date_of_birth: driverData.date_of_birth,
            email: driverData.email,
            emergency_contact_name: driverData.emergency_contact_name,
            emergency_contact_phone: driverData.emergency_contact_phone,
            employee_id: driverData.employee_id,
            employment_status: driverData.employment_status,
            first_name: driverData.first_name,
            hire_date: driverData.hire_date,
            is_active: driverData.is_active,
            last_name: driverData.last_name,
            national_id: driverData.national_id,
            notes: driverData.notes,
            phone_number: driverData.phone_number,
            license: {
              expiry_date: driverData.license?.expiry_date || "",
              issue_date: driverData.license?.issue_date || "",
              issuing_authority: driverData.license?.issuing_authority || "",
              license_class: driverData.license?.license_class || "",
              license_number: driverData.license?.license_number || "",
              notes: driverData.license?.notes || "",
              restrictions: driverData.license?.restrictions || "",
              status: driverData.license?.status || "valid",
            },
          });
          setInitialValues({
            address: driverData.address,
            alternate_phone_number: driverData.alternate_phone_number,
            date_of_birth: driverData.date_of_birth,
            email: driverData.email,
            emergency_contact_name: driverData.emergency_contact_name,
            emergency_contact_phone: driverData.emergency_contact_phone,
            employee_id: driverData.employee_id,
            employment_status: driverData.employment_status,
            first_name: driverData.first_name,
            hire_date: driverData.hire_date,
            is_active: driverData.is_active,
            last_name: driverData.last_name,
            national_id: driverData.national_id,
            notes: driverData.notes,
            phone_number: driverData.phone_number,
            license: {
              expiry_date: driverData.license?.expiry_date || "",
              issue_date: driverData.license?.issue_date || "",
              issuing_authority: driverData.license?.issuing_authority || "",
              license_class: driverData.license?.license_class || "",
              license_number: driverData.license?.license_number || "",
              notes: driverData.license?.notes || "",
              restrictions: driverData.license?.restrictions || "",
              status: driverData.license?.status || "valid",
            },
          });
        } else {
          const initial = createInitialDriverFormValues();
          setFormValues(initial);
          setInitialValues(initial);
        }
      } catch {
        if (active) {
          setError("We could not load the driver details.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadDriver();

    return () => {
      active = false;
    };
  }, [driverId]);

  function updateField<K extends keyof DriverFormValues>(field: K, value: DriverFormValues[K]) {
    setFormValues((current) => ({ ...current, [field]: value }));
    if (fieldErrors[field as string]) {
      setFieldErrors((current) => ({ ...current, [field as string]: undefined }));
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

    const validationErrors = validateDriverForm(formValues);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setError("Please correct the highlighted fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      if (driverId) {
        await driversApi.updateDriver(driverId, formValues);
        showToast({ title: "Driver updated", message: "Driver profile has been updated.", tone: "success" });
        navigate(appRoutes.driverDetail(driverId));
      } else {
        await driversApi.createDriver(formValues);
        showToast({ title: "Driver created", message: "New driver has been added.", tone: "success" });
        navigate(appRoutes.drivers);
      }
    } catch (err: unknown) {
      const responseData = (err as { response?: { data?: unknown } })?.response?.data;
      if (responseData && typeof responseData === "object") {
        const nextFieldErrors: Partial<Record<keyof DriverFormValues, string>> = {};
        for (const [key, value] of Object.entries(responseData)) {
          if (key in formValues) {
            nextFieldErrors[key as keyof DriverFormValues] = Array.isArray(value) ? String(value[0]) : String(value);
          }
        }
        setFieldErrors(nextFieldErrors);
        setError("Please correct the errors below.");
      } else {
        setError(driverId ? "Unable to save driver changes." : "Unable to create driver.");
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
