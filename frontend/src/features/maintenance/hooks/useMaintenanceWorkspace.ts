import { useEffect, useState } from "react";

import { useNotifications } from "@/core/contexts/useNotifications";
import { useAppDispatch, useAppSelector } from "@/core/store/hooks";
import {
  buildMaintenanceSummaryMetrics,
  createInitialMechanicFormValues,
  createInitialPartUsedFormValues,
  createInitialScheduleFormValues,
  createInitialServiceRecordFormValues,
  maintenanceApi,
} from "@/features/maintenance/services/maintenance.api";
import {
  setMaintenanceFilters,
  setMaintenanceView,
} from "@/features/maintenance/store/maintenance.slice";
import type {
  MaintenanceScheduleFormValues,
  MaintenanceScheduleRecord,
  MaintenanceSummaryMetrics,
  MaintenanceView,
  MechanicFormValues,
  MechanicRecord,
  PartUsedFormValues,
  PartUsedRecord,
  ServiceRecordFormValues,
  ServiceRecordRecord,
} from "@/features/maintenance/types/maintenance";

const EMPTY_SUMMARY: MaintenanceSummaryMetrics = {
  activeMechanics: 0,
  completedServices: 0,
  dueSchedules: 0,
  openServices: 0,
  overdueSchedules: 0,
  totalServiceCost: 0,
};

export function useMaintenanceWorkspace() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.maintenance);
  const { showToast } = useNotifications();

  const [mechanics, setMechanics] = useState<MechanicRecord[]>([]);
  const [schedules, setSchedules] = useState<MaintenanceScheduleRecord[]>([]);
  const [serviceRecords, setServiceRecords] = useState<ServiceRecordRecord[]>([]);
  const [partsUsed, setPartsUsed] = useState<PartUsedRecord[]>([]);
  const [summary, setSummary] = useState<MaintenanceSummaryMetrics>(EMPTY_SUMMARY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [submittingView, setSubmittingView] = useState<MaintenanceView | null>(null);

  const [mechanicForm, setMechanicForm] = useState<MechanicFormValues>(
    createInitialMechanicFormValues
  );
  const [scheduleForm, setScheduleForm] = useState<MaintenanceScheduleFormValues>(
    createInitialScheduleFormValues
  );
  const [serviceRecordForm, setServiceRecordForm] = useState<ServiceRecordFormValues>(
    createInitialServiceRecordFormValues
  );
  const [partUsedForm, setPartUsedForm] = useState<PartUsedFormValues>(
    createInitialPartUsedFormValues
  );
  const [lookups, setLookups] = useState<{
    items: { id: number; label: string; subtitle?: string }[];
    mechanics: { id: number; label: string; subtitle?: string }[];
    schedules: { id: number; label: string; subtitle?: string }[];
    serviceRecords: { id: number; label: string; subtitle?: string }[];
    vehicles: { id: number; label: string; subtitle?: string }[];
  }>({
    items: [],
    mechanics: [],
    schedules: [],
    serviceRecords: [],
    vehicles: [],
  });

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError("");

    Promise.all([
      maintenanceApi.fetchMechanics(filters),
      maintenanceApi.fetchSchedules(filters),
      maintenanceApi.fetchServiceRecords(filters),
      maintenanceApi.fetchPartsUsed(filters),
      maintenanceApi.fetchLookups(),
    ])
      .then(([mechanicsData, schedulesData, serviceData, partsData, lookupData]) => {
        if (!active) {
          return;
        }

        setMechanics(mechanicsData);
        setSchedules(schedulesData);
        setServiceRecords(serviceData);
        setPartsUsed(partsData);
        setLookups(lookupData);
        setSummary(
          buildMaintenanceSummaryMetrics({
            mechanics: mechanicsData,
            schedules: schedulesData,
            serviceRecords: serviceData,
          })
        );
      })
      .catch(() => {
        if (active) {
          setError("We could not load the maintenance workspace right now.");
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
    try {
      const [mechanicsData, schedulesData, serviceData, partsData, lookupData] =
        await Promise.all([
          maintenanceApi.fetchMechanics(filters),
          maintenanceApi.fetchSchedules(filters),
          maintenanceApi.fetchServiceRecords(filters),
          maintenanceApi.fetchPartsUsed(filters),
          maintenanceApi.fetchLookups(),
        ]);

      setMechanics(mechanicsData);
      setSchedules(schedulesData);
      setServiceRecords(serviceData);
      setPartsUsed(partsData);
      setLookups(lookupData);
      setSummary(
        buildMaintenanceSummaryMetrics({
          mechanics: mechanicsData,
          schedules: schedulesData,
          serviceRecords: serviceData,
        })
      );
    } catch {
      setError("We could not refresh the maintenance workspace right now.");
    } finally {
      setIsLoading(false);
    }
  }

  async function submitForView(view: MaintenanceView) {
    setSubmittingView(view);
    setError("");

    try {
      switch (view) {
        case "mechanics":
          await maintenanceApi.createMechanic(mechanicForm);
          setMechanicForm(createInitialMechanicFormValues());
          break;
        case "schedules":
          await maintenanceApi.createSchedule(scheduleForm);
          setScheduleForm(createInitialScheduleFormValues());
          break;
        case "service-records":
          await maintenanceApi.createServiceRecord(serviceRecordForm);
          setServiceRecordForm(createInitialServiceRecordFormValues());
          break;
        case "parts-used":
          await maintenanceApi.createPartUsed(partUsedForm);
          setPartUsedForm(createInitialPartUsedFormValues());
          break;
      }

      await refreshAll();
      showToast({
        message: `${view.charAt(0).toUpperCase()}${view.slice(1)} workflow updated successfully.`,
        title: "Maintenance updated",
        tone: "success",
      });
    } catch {
      const message =
        "We could not save the maintenance workflow. Please review the form and try again.";
      setError(message);
      showToast({
        message,
        title: "Maintenance save failed",
        tone: "danger",
      });
    } finally {
      setSubmittingView(null);
    }
  }

  return {
    error,
    filters,
    isLoading,
    lookups,
    mechanicForm,
    mechanics,
    partUsedForm,
    partsUsed,
    refreshAll,
    scheduleForm,
    schedules,
    serviceRecordForm,
    serviceRecords,
    setFilters: (payload: Partial<typeof filters>) => dispatch(setMaintenanceFilters(payload)),
    setMechanicForm,
    setPartUsedForm,
    setScheduleForm,
    setServiceRecordForm,
    setView: (view: MaintenanceView) => dispatch(setMaintenanceView(view)),
    submittingView,
    submitForView,
    summary,
  };
}
