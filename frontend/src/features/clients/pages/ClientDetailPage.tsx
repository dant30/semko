import { ArrowLeft, Edit } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAppSelector } from "@/core/store/hooks";
import { getUserPermissions, hasAnyPermission } from "@/core/auth/permission-utils";
import { permissions } from "@/core/constants/permissions";
import { appRoutes } from "@/core/constants/routes";
import { useNotifications } from "@/core/contexts/useNotifications";
import { ClientDetailContent } from "@/features/clients/components/ClientDetailContent";
import { clientsApi } from "@/features/clients/services/clients.api";
import type { ClientRecord } from "@/features/clients/types/client";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

export function ClientDetailPage() {
  const navigate = useNavigate();
  const { clientId } = useParams();
  const parsedClientId = Number(clientId);
  const { showToast } = useNotifications();
  const authUser = useAppSelector((state) => state.auth.user);

  const canManageClients = hasAnyPermission(getUserPermissions(authUser), [permissions.manageClients]);
  const [client, setClient] = useState<ClientRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!Number.isFinite(parsedClientId)) {
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);
    setError("");

    clientsApi
      .fetchClient(parsedClientId)
      .then((clientData) => {
        if (!active) return;
        setClient(clientData);
      })
      .catch(() => {
        if (active) {
          setError("We could not load the client details.");
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
  }, [parsedClientId]);

  async function handleStatusChange(active: boolean) {
    if (!client) return;

    try {
      const updatedClient = await clientsApi.updateClient(client.id, { is_active: active, status: active ? "active" : client.status });
      setClient(updatedClient);
      showToast({
        title: active ? "Client activated" : "Client deactivated",
        message: `Client has been ${active ? "activated" : "deactivated"}.`,
        tone: "success",
      });
    } catch {
      showToast({
        title: "Update failed",
        message: "Could not update client status.",
        tone: "danger",
      });
    }
  }

  if (!Number.isFinite(parsedClientId)) {
    return (
      <Card className="rounded-[2rem] p-6">
        <p className="text-sm text-app-secondary">This client detail route is not valid.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-app-muted">Client management</p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
            {client ? client.name : "Client detail"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-app-secondary">
            Review the selected client profile and manage the record from a dedicated detail view.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => navigate(appRoutes.clients)} type="button" variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to clients
          </Button>
          {client && canManageClients ? (
            <Button
              onClick={() => navigate(appRoutes.clientEdit(client.id))}
              type="button"
              variant="secondary"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit client
            </Button>
          ) : null}
        </div>
      </div>

      <Card className="rounded-[2rem] p-6">
        <ClientDetailContent
          canManageClients={canManageClients}
          client={client}
          error={error}
          isLoading={isLoading}
          onStatusChange={handleStatusChange}
        />
      </Card>
    </div>
  );
}
