import { useNavigate, useParams } from "react-router-dom";

import { appRoutes } from "@/core/constants/routes";
import { ClientForm } from "@/features/clients/components/ClientForm";
import { useClientForm } from "@/features/clients/hooks/useClientForm";
import { Badge } from "@/shared/components/ui/Badge";
import { Card } from "@/shared/components/ui/Card";

export function ClientEditPage() {
  const navigate = useNavigate();
  const params = useParams();
  const clientId = Number(params.clientId);
  const {
    confirmDiscardChanges,
    error,
    fieldErrors,
    formValues,
    isLoading,
    isSubmitting,
    submit,
    updateField,
  } = useClientForm(Number.isFinite(clientId) ? clientId : undefined);

  if (!Number.isFinite(clientId)) {
    return (
      <div className="space-y-6">
        <Card className="rounded-[2rem] p-6">
          <p className="text-sm text-app-secondary">This client edit route is not valid.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/65">
        <Badge variant="accent">Client update</Badge>
        <h1 className="mt-4">Edit client details</h1>
        <p className="mt-3 max-w-3xl text-base md:text-lg">
          Modify the client profile, contact information, and status for an existing client record.
        </p>
      </section>

      <ClientForm
        error={error}
        fieldErrors={fieldErrors}
        formValues={formValues}
        isLoading={isLoading}
        isSubmitting={isSubmitting}
        mode="edit"
        onCancel={() => {
          if (confirmDiscardChanges()) {
            navigate(appRoutes.clients);
          }
        }}
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
        updateField={updateField}
      />
    </div>
  );
}
