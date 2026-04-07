import { ArrowLeft, Edit } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { useAppSelector } from "@/core/store/hooks";
import { getUserPermissions, hasAnyPermission } from "@/core/auth/permission-utils";
import { permissions } from "@/core/constants/permissions";
import { appRoutes } from "@/core/constants/routes";
import { useDriverDetail } from "@/features/drivers/hooks/useDriverDetail";
import { DriverDetailContent } from "@/features/drivers/components/DriverDetailContent";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

export function DriverDetailPage() {
  const navigate = useNavigate();
  const { driverId } = useParams();
  const parsedDriverId = Number(driverId);
  const authUser = useAppSelector((state) => state.auth.user);
  const canManageDrivers = hasAnyPermission(getUserPermissions(authUser), [permissions.manageDrivers]);
  const { driver, error, isLoading, updateStatus } = useDriverDetail(Number.isFinite(parsedDriverId) ? parsedDriverId : undefined);

  if (!Number.isFinite(parsedDriverId)) {
    return (
      <div className="space-y-6">
        <Card className="rounded-[2rem] p-6">
          <p className="text-sm text-app-secondary">This driver detail route is not valid.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-app-muted">Driver management</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{driver ? driver.full_name : "Driver details"}</h1>
          <p className="mt-2 max-w-2xl text-sm text-app-secondary">
            Review the selected driver profile and maintain the record from a dedicated detail view.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => navigate(appRoutes.drivers)} type="button" variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to drivers
          </Button>
          {driver && canManageDrivers ? (
            <Button onClick={() => navigate(appRoutes.driverEdit(driver.id))} type="button" variant="secondary">
              <Edit className="mr-2 h-4 w-4" />
              Edit driver
            </Button>
          ) : null}
        </div>
      </div>

      <Card className="rounded-[2rem] p-6">
        <DriverDetailContent
          canManageDrivers={canManageDrivers}
          driver={driver}
          error={error}
          isLoading={isLoading}
          onStatusChange={updateStatus}
        />
      </Card>
    </div>
  );
}
