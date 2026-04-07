import { useNavigate } from "react-router-dom";

import { appRoutes } from "@/core/constants/routes";
import { ClientForm } from "@/features/clients/components/ClientForm";
import { useClientForm } from "@/features/clients/hooks/useClientForm";
import { Badge } from "@/shared/components/ui/Badge";

export function ClientCreatePage() {
  const navigate = useNavigate();
  const {
    confirmDiscardChanges,
    error,
    fieldErrors,
    formValues,
    isLoading,
    isSubmitting,
    submit,
    updateField,
  } = useClientForm();

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/65">
        <Badge variant="accent">New client</Badge>
        <h1 className="mt-4">Create client account</h1>
        <p className="mt-3 max-w-3xl text-base md:text-lg">
          Add a new master data client and keep the register up to date for billing or logistics.
        </p>
      </section>

      <ClientForm
        error={error}
        fieldErrors={fieldErrors}
        formValues={formValues}
        isLoading={isLoading}
        isSubmitting={isSubmitting}
        mode="create"
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
