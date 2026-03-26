import { useEffect, useState } from "react";

import { useNotifications } from "@/core/contexts/useNotifications";
import { useAppDispatch, useAppSelector } from "@/core/store/hooks";
import {
  buildFuelSummaryMetrics,
  createInitialFuelConsumptionFormValues,
  createInitialFuelStationFormValues,
  createInitialFuelTransactionFormValues,
  fuelApi,
} from "@/features/fuel/services/fuel.api";
import { setFuelFilters, setFuelView } from "@/features/fuel/store/fuel.slice";
import type {
  FuelConsumptionFormValues,
  FuelConsumptionRecord,
  FuelStationFormValues,
  FuelStationRecord,
  FuelSummaryMetrics,
  FuelTransactionFormValues,
  FuelTransactionRecord,
  FuelView,
} from "@/features/fuel/types/fuel";

const EMPTY_SUMMARY: FuelSummaryMetrics = {
  activeStations: 0,
  averageKmPerLitre: 0,
  fullTankTransactions: 0,
  fuelVolume: 0,
  totalFuelSpend: 0,
  trackedConsumptionPeriods: 0,
};

export function useFuelWorkspace() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.fuel);
  const { showToast } = useNotifications();

  const [stations, setStations] = useState<FuelStationRecord[]>([]);
  const [transactions, setTransactions] = useState<FuelTransactionRecord[]>([]);
  const [consumptions, setConsumptions] = useState<FuelConsumptionRecord[]>([]);
  const [summary, setSummary] = useState<FuelSummaryMetrics>(EMPTY_SUMMARY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [submittingView, setSubmittingView] = useState<FuelView | null>(null);

  const [stationForm, setStationForm] = useState<FuelStationFormValues>(
    createInitialFuelStationFormValues
  );
  const [transactionForm, setTransactionForm] = useState<FuelTransactionFormValues>(
    createInitialFuelTransactionFormValues
  );
  const [consumptionForm, setConsumptionForm] = useState<FuelConsumptionFormValues>(
    createInitialFuelConsumptionFormValues
  );
  const [lookups, setLookups] = useState<{
    drivers: { id: number; label: string; subtitle?: string }[];
    stations: { id: number; label: string; subtitle?: string }[];
    trips: { id: number; label: string; subtitle?: string }[];
    vehicles: { id: number; label: string; subtitle?: string }[];
  }>({
    drivers: [],
    stations: [],
    trips: [],
    vehicles: [],
  });

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError("");

    Promise.all([
      fuelApi.fetchStations(filters),
      fuelApi.fetchTransactions(filters),
      fuelApi.fetchConsumption(filters),
      fuelApi.fetchLookups(),
    ])
      .then(([stationsData, transactionsData, consumptionsData, lookupData]) => {
        if (!active) {
          return;
        }

        setStations(stationsData);
        setTransactions(transactionsData);
        setConsumptions(consumptionsData);
        setLookups(lookupData);
        setSummary(
          buildFuelSummaryMetrics({
            consumptions: consumptionsData,
            stations: stationsData,
            transactions: transactionsData,
          })
        );
      })
      .catch(() => {
        if (active) {
          setError("We could not load the fuel workspace right now.");
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
      const [stationsData, transactionsData, consumptionsData, lookupData] = await Promise.all([
        fuelApi.fetchStations(filters),
        fuelApi.fetchTransactions(filters),
        fuelApi.fetchConsumption(filters),
        fuelApi.fetchLookups(),
      ]);

      setStations(stationsData);
      setTransactions(transactionsData);
      setConsumptions(consumptionsData);
      setLookups(lookupData);
      setSummary(
        buildFuelSummaryMetrics({
          consumptions: consumptionsData,
          stations: stationsData,
          transactions: transactionsData,
        })
      );
    } catch {
      setError("We could not refresh the fuel workspace right now.");
    } finally {
      setIsLoading(false);
    }
  }

  async function submitForView(view: FuelView) {
    setSubmittingView(view);
    setError("");

    try {
      switch (view) {
        case "stations":
          await fuelApi.createStation(stationForm);
          setStationForm(createInitialFuelStationFormValues());
          break;
        case "transactions":
          await fuelApi.createTransaction(transactionForm);
          setTransactionForm(createInitialFuelTransactionFormValues());
          break;
        case "consumption":
          await fuelApi.createConsumption(consumptionForm);
          setConsumptionForm(createInitialFuelConsumptionFormValues());
          break;
      }

      await refreshAll();
      showToast({
        message: `${view.charAt(0).toUpperCase()}${view.slice(1)} workflow updated successfully.`,
        title: "Fuel updated",
        tone: "success",
      });
    } catch {
      const message = "We could not save the fuel workflow. Please review the form and try again.";
      setError(message);
      showToast({
        message,
        title: "Fuel save failed",
        tone: "danger",
      });
    } finally {
      setSubmittingView(null);
    }
  }

  return {
    consumptionForm,
    consumptions,
    error,
    filters,
    isLoading,
    lookups,
    refreshAll,
    setConsumptionForm,
    setFilters: (payload: Partial<typeof filters>) => dispatch(setFuelFilters(payload)),
    setStationForm,
    setTransactionForm,
    setView: (view: FuelView) => dispatch(setFuelView(view)),
    stationForm,
    stations,
    submittingView,
    submitForView,
    summary,
    transactionForm,
    transactions,
  };
}
