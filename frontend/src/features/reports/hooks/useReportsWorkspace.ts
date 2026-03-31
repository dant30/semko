import { useCallback, useEffect, useRef, useState } from "react";

import { useNotifications } from "@/core/contexts/useNotifications";
import { useAppDispatch, useAppSelector } from "@/core/store/hooks";
import { reportsApi } from "@/features/reports/services/reports.api";
import {
  setPeriods,
  setSelectedPeriodId,
  setSummary,
} from "@/features/reports/store/reports.slice";

export function useReportsWorkspace() {
  const dispatch = useAppDispatch();
  const periods = useAppSelector((state) => state.reports.periods);
  const selectedPeriodId = useAppSelector((state) => state.reports.selectedPeriodId);
  const summary = useAppSelector((state) => state.reports.summary);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useNotifications();
  const isMountedRef = useRef(false);

  const handleError = useCallback(
    (message: string) => {
      if (!isMountedRef.current) {
        return;
      }
      setError(message);
      showToast({
        title: "Reports load failed",
        message,
        tone: "danger",
      });
    },
    [showToast]
  );

  const loadPayrollPeriods = useCallback(async () => {
    setError("");
    setIsLoading(true);

    try {
      const response = await reportsApi.fetchPayrollPeriods();

      if (!isMountedRef.current) {
        return;
      }

      dispatch(setPeriods(response));
      dispatch(setSummary(null));
      if (response.length > 0 && selectedPeriodId === null) {
        dispatch(setSelectedPeriodId(response[0].id));
      }
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Unable to load reports.";
      handleError(message);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [dispatch, handleError, selectedPeriodId]);

  const loadPayrollPeriodSummary = useCallback(
    async (payrollPeriodId: number) => {
      setError("");
      setIsLoading(true);

      dispatch(setSummary(null));

      try {
        const response = await reportsApi.fetchPayrollPeriodSummary(payrollPeriodId);

        if (!isMountedRef.current) {
          return;
        }

        dispatch(setSelectedPeriodId(payrollPeriodId));
        dispatch(setSummary(response));
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : "Unable to load report details.";
        handleError(message);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [dispatch, handleError]
  );

  const exportPayrollPeriodCsv = useCallback(
    async (payrollPeriodId: number) => {
      setError("");
      setIsExporting(true);

      try {
        const blob = await reportsApi.exportPayrollPeriodCsv(payrollPeriodId);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `payroll-period-${payrollPeriodId}-summary.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : "Unable to export report.";
        handleError(message);
      } finally {
        if (isMountedRef.current) {
          setIsExporting(false);
        }
      }
    },
    [handleError]
  );

  useEffect(() => {
    isMountedRef.current = true;
    void loadPayrollPeriods();

    return () => {
      isMountedRef.current = false;
    };
  }, [loadPayrollPeriods]);

  useEffect(() => {
    if (selectedPeriodId !== null && !summary) {
      void loadPayrollPeriodSummary(selectedPeriodId);
    }
  }, [selectedPeriodId, summary, loadPayrollPeriodSummary]);

  return {
    periods,
    selectedPeriodId,
    summary,
    isLoading,
    isExporting,
    error,
    loadPayrollPeriods,
    loadPayrollPeriodSummary,
    exportPayrollPeriodCsv,
  };
}
