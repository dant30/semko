import { useEffect, useMemo, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/core/store/hooks";
import { useNotifications } from "@/core/contexts/useNotifications";
import { clientsApi } from "@/features/clients/services/clients.api";
import { setClientsFilters } from "@/features/clients/store/clients.slice";
import type { ClientFilters, ClientRecord } from "@/features/clients/types/client";

export function useClientsWorkspace() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.clients);
  const { showToast } = useNotifications();

  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadClients() {
      setIsLoading(true);
      setError("");

      try {
        const data = await clientsApi.fetchClients(filters);
        if (!active) return;
        setClients(data);
      } catch {
        if (active) {
          setError("Unable to load clients at this time.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadClients();

    return () => {
      active = false;
    };
  }, [filters]);

  const setFilters = (changes: Partial<ClientFilters>) => {
    dispatch(setClientsFilters(changes));
  };

  const resetFilters = () => {
    dispatch(
      setClientsFilters({
        search: "",
        clientType: "",
        status: "",
        activeOnly: true,
      })
    );
  };

  const refreshClients = async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await clientsApi.fetchClients(filters);
      setClients(data);
    } catch {
      setError("Unable to refresh clients right now.");
      showToast({ message: "Unable to refresh clients", tone: "danger" });
    } finally {
      setIsLoading(false);
    }
  };

  const summary = useMemo(
    () => ({
      total: clients.length,
      active: clients.filter((client) => client.is_active).length,
      inactive: clients.filter((client) => !client.is_active).length,
      corporate: clients.filter((client) => client.client_type === "corporate").length,
      individual: clients.filter((client) => client.client_type === "individual").length,
    }),
    [clients]
  );

  return {
    clients,
    isLoading,
    error,
    filters,
    summary,
    setFilters,
    resetFilters,
    refreshClients,
  } as const;
}
