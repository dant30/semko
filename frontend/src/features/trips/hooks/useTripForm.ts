import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useNotifications } from "@/core/contexts/useNotifications";
import { appRoutes } from "@/core/constants/routes";
import {
  createInitialTripFormValues,
  mapFormValuesToTripPayload,
  mapTripRecordToFormValues,
  tripsApi,
} from "@/features/trips/services/trips.api";
import type { TripFormValues, TripLookupOption } from "@/features/trips/types/trip";

interface TripLookups {
  clients: TripLookupOption[];
  drivers: TripLookupOption[];
  materials: TripLookupOption[];
  quarries: TripLookupOption[];
  vehicles: TripLookupOption[];
}

const EMPTY_LOOKUPS: TripLookups = {
  clients: [],
  drivers: [],
  materials: [],
  quarries: [],
  vehicles: [],
};

export function useTripForm(tripId?: number) {
  const navigate = useNavigate();
  const { showToast } = useNotifications();
  const [formValues, setFormValues] = useState<TripFormValues>(createInitialTripFormValues);
  const [initialValues, setInitialValues] = useState<TripFormValues>(createInitialTripFormValues);
  const [lookups, setLookups] = useState<TripLookups>(EMPTY_LOOKUPS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof TripFormValues, string>>>(
    {}
  );

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError("");

    Promise.all([
      tripsApi.fetchTripLookups(),
      tripId ? tripsApi.fetchTripDetail(tripId) : Promise.resolve(null),
    ])
      .then(([lookupData, trip]) => {
        if (!active) {
          return;
        }

        setLookups(lookupData);
        if (trip) {
          const mapped = mapTripRecordToFormValues(trip);
          setFormValues(mapped);
          setInitialValues(mapped);
        } else {
          const initial = createInitialTripFormValues();
          setFormValues(initial);
          setInitialValues(initial);
        }
      })
      .catch(() => {
        if (active) {
          setError("We could not prepare the trip form right now.");
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
  }, [tripId]);

  useEffect(() => {
    const hasUnsavedChanges = JSON.stringify({ ...formValues, delivery_note_file: null }) !==
      JSON.stringify({ ...initialValues, delivery_note_file: null });

    if (!hasUnsavedChanges) {
      return undefined;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [formValues, initialValues]);

  const filteredQuarries = useMemo(() => {
    if (!formValues.client_id) {
      return lookups.quarries;
    }

    return lookups.quarries.filter(
      (quarry) => String(quarry.parentId || "") === formValues.client_id
    );
  }, [formValues.client_id, lookups.quarries]);

  function updateField<K extends keyof TripFormValues>(field: K, value: TripFormValues[K]) {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
    setFieldErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  }

  function validateForm() {
    const nextErrors: Partial<Record<keyof TripFormValues, string>> = {};

    if (!formValues.trip_number.trim()) nextErrors.trip_number = "Trip number is required.";
    if (!formValues.delivery_note_number.trim()) {
      nextErrors.delivery_note_number = "Delivery note number is required.";
    }
    if (!formValues.trip_date) nextErrors.trip_date = "Trip date is required.";
    if (!formValues.vehicle_id) nextErrors.vehicle_id = "Vehicle is required.";
    if (!formValues.driver_id) nextErrors.driver_id = "Driver is required.";
    if (!formValues.client_id) nextErrors.client_id = "Client is required.";
    if (!formValues.quarry_id) nextErrors.quarry_id = "Quarry is required.";
    if (!formValues.material_id) nextErrors.material_id = "Material is required.";
    if (!formValues.destination.trim()) nextErrors.destination = "Destination is required.";
    if (!formValues.expected_quantity || Number(formValues.expected_quantity) <= 0) {
      nextErrors.expected_quantity = "Expected quantity must be greater than zero.";
    }
    if (!formValues.agreed_unit_price || Number(formValues.agreed_unit_price) < 0) {
      nextErrors.agreed_unit_price = "Agreed unit price must be zero or greater.";
    }

    const hasAnyWeighbridgeField = [
      formValues.quarry_gross_weight,
      formValues.quarry_tare_weight,
      formValues.site_gross_weight,
      formValues.site_tare_weight,
    ].some(Boolean);

    if (hasAnyWeighbridgeField) {
      if (!formValues.quarry_gross_weight) nextErrors.quarry_gross_weight = "Required.";
      if (!formValues.quarry_tare_weight) nextErrors.quarry_tare_weight = "Required.";
      if (!formValues.site_gross_weight) nextErrors.site_gross_weight = "Required.";
      if (!formValues.site_tare_weight) nextErrors.site_tare_weight = "Required.";

      if (
        formValues.quarry_gross_weight &&
        formValues.quarry_tare_weight &&
        Number(formValues.quarry_gross_weight) < Number(formValues.quarry_tare_weight)
      ) {
        nextErrors.quarry_gross_weight = "Gross weight must be >= tare weight.";
      }

      if (
        formValues.site_gross_weight &&
        formValues.site_tare_weight &&
        Number(formValues.site_gross_weight) < Number(formValues.site_tare_weight)
      ) {
        nextErrors.site_gross_weight = "Gross weight must be >= tare weight.";
      }
    }

    if (formValues.trip_type === "hired") {
      if (!formValues.hired_owner_name.trim()) {
        nextErrors.hired_owner_name = "Owner name is required for hired trips.";
      }
      if (!formValues.hired_owner_rate_per_trip || Number(formValues.hired_owner_rate_per_trip) < 0) {
        nextErrors.hired_owner_rate_per_trip =
          "Owner rate per trip must be zero or greater.";
      }
    }

    if (
      formValues.delivery_note_file &&
      !/\.(pdf|jpg|jpeg|png|txt)$/i.test(formValues.delivery_note_file.name)
    ) {
      nextErrors.delivery_note_file = "Allowed types: PDF, JPG, PNG, TXT.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function confirmDiscardChanges() {
    const hasUnsavedChanges =
      JSON.stringify({ ...formValues, delivery_note_file: null }) !==
      JSON.stringify({ ...initialValues, delivery_note_file: null });

    if (!hasUnsavedChanges) {
      return true;
    }

    return window.confirm("You have unsaved trip changes. Leave this form?");
  }

  async function submit() {
    if (!validateForm()) {
      setError("Please correct the highlighted trip fields and try again.");
      showToast({
        message: "Please correct the highlighted trip fields and try again.",
        title: "Trip form incomplete",
        tone: "warning",
      });
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const payload = mapFormValuesToTripPayload(formValues);
      let savedTripId = tripId;

      if (tripId) {
        const trip = await tripsApi.updateTrip(tripId, payload);
        savedTripId = trip.id;
      } else {
        const trip = await tripsApi.createTrip(payload);
        savedTripId = trip.id;
      }

      if (savedTripId) {
        await tripsApi.updateTripDocuments(savedTripId, {
          deliveryNoteFile: formValues.delivery_note_file,
          documentsVerified: formValues.documents_verified,
        });
      }

      showToast({
        message:
          modeMessage(tripId ? "updated" : "created"),
        title: "Trip saved",
        tone: "success",
      });
      navigate(appRoutes.trips);
    } catch {
      setError("We could not save the trip. Please review the form and try again.");
      showToast({
        message: "We could not save the trip. Please review the form and try again.",
        title: "Trip save failed",
        tone: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function modeMessage(mode: "created" | "updated") {
    return mode === "created"
      ? "The trip has been created successfully."
      : "The trip changes have been saved successfully.";
  }

  return {
    confirmDiscardChanges,
    error,
    fieldErrors,
    filteredQuarries,
    formValues,
    isLoading,
    isSubmitting,
    lookups,
    setFormValues,
    submit,
    updateField,
  };
}
