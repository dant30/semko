import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useNotifications } from "@/core/contexts/useNotifications";
import { useAppDispatch, useAppSelector } from "@/core/store/hooks";
import { payrollApi } from "@/features/payroll/services/payroll.api";
import {
  clearSelectedPayrollPeriodId,
  setSelectedPayrollPeriodId,
} from "@/features/payroll/store/payroll.slice";
import type {
  PayrollPeriodCreatePayload,
  PayrollPeriodRecord,
} from "@/features/payroll/types/payroll";

export function usePayrollWorkspace() {
  const dispatch = useAppDispatch();
  const { showToast } = useNotifications();
  const selectedPeriodId = useAppSelector((state) => state.payroll.selectedPayrollPeriodId);
  const selectedPeriodIdRef = useRef<number | null>(selectedPeriodId);
  const [periods, setPeriods] = useState<PayrollPeriodRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    selectedPeriodIdRef.current = selectedPeriodId;
  }, [selectedPeriodId]);

  const loadPeriods = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const periodsData = await payrollApi.fetchPayrollPeriods();
      setPeriods(periodsData);

      const validSelectedId = periodsData.some((period) => period.id === selectedPeriodIdRef.current)
        ? selectedPeriodIdRef.current
        : periodsData[0]?.id ?? null;

      if (validSelectedId !== selectedPeriodIdRef.current) {
        dispatch(setSelectedPayrollPeriodId(validSelectedId));
      }

      if (validSelectedId === null && periodsData.length === 0) {
        dispatch(clearSelectedPayrollPeriodId());
      }
    } catch {
      setError("Unable to load payroll periods. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    void loadPeriods();
  }, [loadPeriods]);

  const selectedPeriod = useMemo(
    () => periods.find((period) => period.id === selectedPeriodId) ?? null,
    [periods, selectedPeriodId]
  );

  const refreshPeriods = useCallback(async () => {
    await loadPeriods();
  }, [loadPeriods]);

  const selectPeriod = useCallback(
    (periodId: number) => {
      dispatch(setSelectedPayrollPeriodId(periodId));
    },
    [dispatch]
  );

  const createPayrollPeriod = useCallback(
    async (payload: PayrollPeriodCreatePayload) => {
      setIsSaving(true);
      setError("");

      try {
        await payrollApi.createPayrollPeriod(payload);
        showToast({
          title: "Payroll period created",
          message: "The new payroll period has been added successfully.",
          tone: "success",
        });
        await loadPeriods();
      } catch {
        const message = "Unable to create payroll period. Please check your input and try again.";
        setError(message);
        showToast({ title: "Create failed", message, tone: "danger" });
      } finally {
        setIsSaving(false);
      }
    },
    [loadPeriods, showToast]
  );

  const generatePayrollFromTrips = useCallback(
    async (periodId: number) => {
      setIsSubmittingAction(true);
      setError("");

      try {
        await payrollApi.generatePayrollFromTrips(periodId);
        showToast({
          title: "Payroll generated",
          message: "Payslips were generated from trip data.",
          tone: "success",
        });
        await loadPeriods();
      } catch {
        const message = "Unable to generate payroll for this period. Please try again.";
        setError(message);
        showToast({ title: "Generate failed", message, tone: "danger" });
      } finally {
        setIsSubmittingAction(false);
      }
    },
    [loadPeriods, showToast]
  );

  const approvePayrollPeriod = useCallback(
    async (periodId: number) => {
      setIsSubmittingAction(true);
      setError("");

      try {
        await payrollApi.approvePayrollPeriod(periodId);
        showToast({
          title: "Payroll approved",
          message: "The payroll period has been approved successfully.",
          tone: "success",
        });
        await loadPeriods();
      } catch {
        const message = "Unable to approve this payroll period. Please try again.";
        setError(message);
        showToast({ title: "Approve failed", message, tone: "danger" });
      } finally {
        setIsSubmittingAction(false);
      }
    },
    [loadPeriods, showToast]
  );

  const lockPayrollPeriod = useCallback(
    async (periodId: number) => {
      setIsSubmittingAction(true);
      setError("");

      try {
        await payrollApi.lockPayrollPeriod(periodId);
        showToast({
          title: "Payroll locked",
          message: "The payroll period has been locked and finalized.",
          tone: "success",
        });
        await loadPeriods();
      } catch {
        const message = "Unable to lock this payroll period. Please try again.";
        setError(message);
        showToast({ title: "Lock failed", message, tone: "danger" });
      } finally {
        setIsSubmittingAction(false);
      }
    },
    [loadPeriods, showToast]
  );

  return {
    periods,
    selectedPeriodId,
    selectedPeriod,
    isLoading,
    isSaving,
    isSubmittingAction,
    error,
    refreshPeriods,
    selectPeriod,
    createPayrollPeriod,
    generatePayrollFromTrips,
    approvePayrollPeriod,
    lockPayrollPeriod,
  };
}
