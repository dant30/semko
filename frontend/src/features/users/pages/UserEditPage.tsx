import { useNavigate, useParams } from "react-router-dom";

import { appRoutes } from "@/core/constants/routes";
import { UserForm } from "@/features/users/components/UserForm";
import { useUserForm } from "@/features/users/hooks";
import { Badge } from "@/shared/components/ui/Badge";

export function UserEditPage() {
  const navigate = useNavigate();
  const params = useParams();
  const userId = Number(params.userId);
  const {
    confirmDiscardChanges,
    error,
    fieldErrors,
    formValues,
    isLoading,
    isSubmitting,
    roles,
    submit,
    updateField,
  } = useUserForm(Number.isNaN(userId) ? undefined : userId);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-soft backdrop-blur dark:border-slate-800 dark:bg-slate-950/65">
        <Badge variant="accent">User update</Badge>
        <h1 className="mt-4">Edit user account</h1>
        <p className="mt-3 max-w-3xl text-base md:text-lg">
          Update the user account details, role assignments, and access permissions.
        </p>
      </section>

      <UserForm
        error={error}
        fieldErrors={fieldErrors}
        formValues={formValues}
        isLoading={isLoading}
        isSubmitting={isSubmitting}
        mode="edit"
        onCancel={() => {
          if (confirmDiscardChanges()) {
            navigate(appRoutes.users);
          }
        }}
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
        roles={roles}
        updateField={updateField}
      />
    </div>
  );
}