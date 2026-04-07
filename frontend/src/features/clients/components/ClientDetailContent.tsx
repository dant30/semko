import { MapPin, Mail, Phone, Users, Shield, XCircle, CheckCircle } from "lucide-react";

import type { ClientRecord } from "@/features/clients/types/client";
import { Badge, Button, Card, Skeleton } from "@/shared/components/ui";
import { EmptyState } from "@/shared/components/feedback/EmptyState";

interface ClientDetailContentProps {
  canManageClients?: boolean;
  client: ClientRecord | null;
  error?: string;
  isLoading?: boolean;
  onStatusChange: (active: boolean) => void;
}

function getStatusBadgeVariant(status: ClientRecord["status"]) {
  switch (status) {
    case "active":
      return "success";
    case "suspended":
      return "warning";
    default:
      return "neutral";
  }
}

export function ClientDetailContent({
  canManageClients = false,
  client,
  error,
  isLoading = false,
  onStatusChange,
}: ClientDetailContentProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>
    );
  }

  if (error) {
    return <EmptyState title="Error loading client" description={error} />;
  }

  if (!client) {
    return (
      <EmptyState
        title="No client details available"
        description="Select a client or use the register to load details for a client record."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent">Client profile</Badge>
            <Badge variant={getStatusBadgeVariant(client.status)}>{client.status}</Badge>
          </div>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">{client.name}</p>
          <p className="text-sm text-app-secondary">
            {client.code} • {client.client_type.charAt(0).toUpperCase() + client.client_type.slice(1)} client
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {canManageClients ? (
            client.is_active ? (
              <Button size="sm" type="button" variant="danger" onClick={() => onStatusChange(false)}>
                <XCircle className="mr-2 h-4 w-4" />
                Deactivate
              </Button>
            ) : (
              <Button size="sm" type="button" variant="primary" onClick={() => onStatusChange(true)}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Activate
              </Button>
            )
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-[2rem] p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/20">
                <Users className="h-5 w-5 text-brand-600" />
              </div>
              <div>
                <p className="font-semibold">Contact details</p>
                <p className="text-sm text-app-secondary">Primary contact person and phone number.</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
              <div>
                <p className="font-medium">Contact person</p>
                <p>{client.contact_person || "—"}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400" />
                <p>{client.phone_number || "—"}</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                <p>{client.email || "—"}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="rounded-[2rem] p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800/60">
                <MapPin className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="font-semibold">Location</p>
                <p className="text-sm text-app-secondary">Physical address and region information.</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
              <div>
                <p className="font-medium">Address</p>
                <p>{client.address || "—"}</p>
              </div>
              <div>
                <p className="font-medium">Town</p>
                <p>{client.town || "—"}</p>
              </div>
              <div>
                <p className="font-medium">County</p>
                <p>{client.county || "—"}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="rounded-[2rem] p-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800/60">
              <Shield className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="font-semibold">Additional information</p>
              <p className="text-sm text-app-secondary">Client status, activity state, and notes.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 text-sm text-slate-700 dark:text-slate-300">
            <div>
              <p className="font-medium">Record status</p>
              <p>{client.is_active ? "Active" : "Inactive"}</p>
            </div>
            <div>
              <p className="font-medium">Created at</p>
              <p>{client.created_at ? new Date(client.created_at).toLocaleDateString() : "—"}</p>
            </div>
          </div>

          <div className="pt-4 text-sm text-slate-700 dark:text-slate-300">
            <p className="font-medium">Notes</p>
            <p>{client.notes || "No notes have been added for this client."}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
