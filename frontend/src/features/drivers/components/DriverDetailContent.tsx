import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import type { DriverRecord } from "@/features/drivers/types/driver";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-surface-border bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
      <p className="text-sm text-app-secondary">{label}</p>
      <p className="mt-1 font-medium text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

export function DriverDetailContent({
  driver,
  error,
  isLoading,
  canManageDrivers,
  onStatusChange,
}: {
  driver: DriverRecord | null;
  error: string;
  isLoading: boolean;
  canManageDrivers: boolean;
  onStatusChange: (isActive: boolean) => void;
}) {
  if (error) {
    return (
      <Card className="rounded-[2rem] border border-rose-200 bg-rose-50 p-5 text-rose-700 dark:border-rose-900 dark:bg-rose-950/20">
        <p>{error}</p>
      </Card>
    );
  }

  if (isLoading || !driver) {
    return (
      <Card className="rounded-[2rem] p-6">
        <div className="space-y-3">
          <div className="h-6 w-40 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="grid gap-3 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-24 rounded-3xl bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const license = driver.license;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <DetailRow label="Employee ID" value={driver.employee_id} />
        <DetailRow label="Driver name" value={driver.full_name} />
        <DetailRow label="Phone" value={driver.phone_number || "N/A"} />
        <DetailRow label="Email" value={driver.email || "N/A"} />
        <DetailRow label="Employment status" value={driver.employment_status.replace(/_/g, " ")} />
        <DetailRow label="Current status" value={driver.is_active ? "Active" : "Inactive"} />
        <DetailRow label="National ID" value={driver.national_id || "N/A"} />
        <DetailRow label="Address" value={driver.address || "N/A"} />
      </div>

      <div className="rounded-[2rem] border border-surface-border bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/50">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-app-muted">License details</p>
            <p className="mt-1 text-sm text-app-secondary">Review the current linked driving license record.</p>
          </div>
          {canManageDrivers ? (
            <Button
              onClick={() => onStatusChange(!driver.is_active)}
              type="button"
              variant="secondary"
            >
              {driver.is_active ? "Deactivate driver" : "Activate driver"}
            </Button>
          ) : null}
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <DetailRow label="License number" value={license?.license_number || "N/A"} />
          <DetailRow label="License class" value={license?.license_class || "N/A"} />
          <DetailRow label="Issue date" value={license?.issue_date || "N/A"} />
          <DetailRow label="Expiry date" value={license?.expiry_date || "N/A"} />
          <DetailRow label="Status" value={license?.status || "N/A"} />
          <DetailRow label="Issuing authority" value={license?.issuing_authority || "N/A"} />
          <DetailRow label="Restrictions" value={license?.restrictions || "None"} />
          <DetailRow label="License notes" value={license?.notes || "None"} />
        </div>
      </div>

      <Card className="rounded-[2rem] border border-surface-border bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/50">
        <p className="text-sm font-semibold uppercase tracking-wider text-app-muted">Operational notes</p>
        <p className="mt-2 text-sm text-app-secondary">{driver.notes || "No additional notes provided."}</p>
      </Card>
    </div>
  );
}
