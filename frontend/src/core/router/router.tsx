import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy } from "react";

import { AuthenticatedGuard } from "./guards/AuthenticatedGuard";
import { GuestGuard } from "./guards/GuestGuard";
import { PermissionGuard } from "./guards/PermissionGuard";
import { AppLayout } from "@/shared/components/layout/AppLayout";
import { PublicLayout } from "@/shared/components/layout/PublicLayout";
import { permissions } from "@/core/constants/permissions";

const LoginPage = lazy(() => import("@/features/auth").then((m) => ({ default: m.LoginPage })));
const ForgotPasswordPage = lazy(() => import("@/features/auth").then((m) => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import("@/features/auth").then((m) => ({ default: m.ResetPasswordPage })));
const ChangePasswordPage = lazy(() => import("@/features/auth").then((m) => ({ default: m.ChangePasswordPage })));
const DashboardPage = lazy(() => import("@/features/dashboard").then((m) => ({ default: m.DashboardPage })));
const UsersPage = lazy(() => import("@/features/users").then((m) => ({ default: m.UsersPage })));
const UserCreatePage = lazy(() => import("@/features/users").then((m) => ({ default: m.UserCreatePage })));
const UserDetailPage = lazy(() => import("@/features/users").then((m) => ({ default: m.UserDetailPage })));
const UserEditPage = lazy(() => import("@/features/users").then((m) => ({ default: m.UserEditPage })));
const UserProfilePage = lazy(() => import("@/features/users").then((m) => ({ default: m.UserProfilePage })));
const RolesPage = lazy(() => import("@/features/roles").then((m) => ({ default: m.RolesPage })));
const AuditPage = lazy(() => import("@/features/audit").then((m) => ({ default: m.AuditPage })));
const VehiclesPage = lazy(() => import("@/features/vehicles").then((m) => ({ default: m.VehiclesPage })));
const DriversPage = lazy(() => import("@/features/drivers").then((m) => ({ default: m.DriversPage })));
const DriverCreatePage = lazy(() => import("@/features/drivers").then((m) => ({ default: m.DriverCreatePage })));
const DriverDetailPage = lazy(() => import("@/features/drivers").then((m) => ({ default: m.DriverDetailPage })));
const DriverEditPage = lazy(() => import("@/features/drivers").then((m) => ({ default: m.DriverEditPage })));
const ClientsPage = lazy(() => import("@/features/clients").then((m) => ({ default: m.ClientsPage })));
const ClientCreatePage = lazy(() => import("@/features/clients").then((m) => ({ default: m.ClientCreatePage })));
const ClientDetailPage = lazy(() => import("@/features/clients").then((m) => ({ default: m.ClientDetailPage })));
const ClientEditPage = lazy(() => import("@/features/clients").then((m) => ({ default: m.ClientEditPage })));
const MaterialsPage = lazy(() => import("@/features/materials").then((m) => ({ default: m.MaterialsPage })));
const MaterialCreatePage = lazy(() => import("@/features/materials").then((m) => ({ default: m.MaterialCreatePage })));
const MaterialDetailPage = lazy(() => import("@/features/materials").then((m) => ({ default: m.MaterialDetailPage })));
const MaterialEditPage = lazy(() => import("@/features/materials").then((m) => ({ default: m.MaterialEditPage })));
const TripsPage = lazy(() => import("@/features/trips").then((m) => ({ default: m.TripsPage })));
const TripCreatePage = lazy(() => import("@/features/trips").then((m) => ({ default: m.TripCreatePage })));
const TripDetailPage = lazy(() => import("@/features/trips").then((m) => ({ default: m.TripDetailPage })));
const TripEditPage = lazy(() => import("@/features/trips").then((m) => ({ default: m.TripEditPage })));
const RulesPage = lazy(() => import("@/features/rules").then((m) => ({ default: m.RulesPage })));
const CessPage = lazy(() => import("@/features/cess").then((m) => ({ default: m.CessPage })));
const StoresPage = lazy(() => import("@/features/stores").then((m) => ({ default: m.StoresPage })));
const FuelPage = lazy(() => import("@/features/fuel").then((m) => ({ default: m.FuelPage })));
const MaintenancePage = lazy(() => import("@/features/maintenance").then((m) => ({ default: m.MaintenancePage })));
const PayrollPage = lazy(() => import("@/features/payroll").then((m) => ({ default: m.PayrollPage })));
const ReportsPage = lazy(() => import("@/features/reports").then((m) => ({ default: m.ReportsPage })));
const NotificationsPage = lazy(() => import("@/features/notifications").then((m) => ({ default: m.NotificationsPage })));
const SettingsPage = lazy(() => import("@/features/settings").then((m) => ({ default: m.SettingsPage })));
const NotFoundPage = lazy(() => import("@/features/not-found").then((m) => ({ default: m.NotFoundPage })));
const UnauthorizedPage = lazy(() => import("@/features/unauthorized").then((m) => ({ default: m.UnauthorizedPage })));
const SupportPage = lazy(() => import("@/features/support").then((m) => ({ default: m.SupportPage })));
const DocsPage = lazy(() => import("@/features/docs").then((m) => ({ default: m.DocsPage })));
const LegalPage = lazy(() => import("@/features/legal").then((m) => ({ default: m.LegalPage })));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/app/dashboard" replace />,
  },
  {
    element: <GuestGuard><PublicLayout /></GuestGuard>,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/reset-password", element: <ResetPasswordPage /> },
    ],
  },
  {
    path: "/support",
    element: <PublicLayout />,
    children: [{ index: true, element: <SupportPage /> }],
  },
  {
    path: "/docs",
    element: <PublicLayout />,
    children: [{ index: true, element: <DocsPage /> }],
  },
  {
    path: "/legal",
    element: <PublicLayout />,
    children: [{ index: true, element: <LegalPage /> }],
  },
  {
    path: "/unauthorized",
    element: <PublicLayout />,
    children: [{ index: true, element: <UnauthorizedPage /> }],
  },
  {
    path: "/app",
    element: <AuthenticatedGuard><AppLayout /></AuthenticatedGuard>,
    children: [
      { path: "dashboard", element: <DashboardPage /> },
      {
        path: "users",
        element: (
          <PermissionGuard requiredPermissions={[permissions.viewUsers]}>
            <UsersPage />
          </PermissionGuard>
        ),
      },
      {
        path: "users/new",
        element: (
          <PermissionGuard requiredPermissions={[permissions.manageUsers]}>
            <UserCreatePage />
          </PermissionGuard>
        ),
      },
      {
        path: "users/:userId",
        element: (
          <PermissionGuard requiredPermissions={[permissions.viewUsers]}>
            <UserDetailPage />
          </PermissionGuard>
        ),
      },
      {
        path: "users/:userId/edit",
        element: (
          <PermissionGuard requiredPermissions={[permissions.manageUsers]}>
            <UserEditPage />
          </PermissionGuard>
        ),
      },
      {
        path: "profile",
        element: <UserProfilePage />,
      },
      {
        path: "password/change",
        element: <ChangePasswordPage />,
      },
      {
        path: "roles",
        element: (
          <PermissionGuard requiredPermissions={[permissions.viewRoles]}>
            <RolesPage />
          </PermissionGuard>
        ),
      },
      {
        path: "audit",
        element: (
          <PermissionGuard requiredPermissions={[permissions.viewAudit]}>
            <AuditPage />
          </PermissionGuard>
        ),
      },
      {
        path: "vehicles",
        element: (
          <PermissionGuard requiredPermissions={[permissions.viewVehicles]}>
            <VehiclesPage />
          </PermissionGuard>
        ),
      },
      {
        path: "vehicles/types",
        element: (
          <PermissionGuard requiredPermissions={[permissions.viewVehicles]}>
            <VehiclesPage />
          </PermissionGuard>
        ),
      },
      {
        path: "vehicles/ownerships",
        element: (
          <PermissionGuard requiredPermissions={[permissions.viewVehicles]}>
            <VehiclesPage />
          </PermissionGuard>
        ),
      },
      {
        path: "drivers",
        element: (
          <PermissionGuard requiredPermissions={[permissions.viewDrivers]}>
            <DriversPage />
          </PermissionGuard>
        ),
      },
      {
        path: "drivers/licenses",
        element: (
          <PermissionGuard requiredPermissions={[permissions.viewDrivers]}>
            <DriversPage />
          </PermissionGuard>
        ),
      },
      {
        path: "drivers/new",
        element: (
          <PermissionGuard requiredPermissions={[permissions.manageDrivers]}>
            <DriverCreatePage />
          </PermissionGuard>
        ),
      },
      {
        path: "drivers/:driverId",
        element: (
          <PermissionGuard requiredPermissions={[permissions.viewDrivers]}>
            <DriverDetailPage />
          </PermissionGuard>
        ),
      },
      {
        path: "drivers/:driverId/edit",
        element: (
          <PermissionGuard requiredPermissions={[permissions.manageDrivers]}>
            <DriverEditPage />
          </PermissionGuard>
        ),
      },
      {
        path: "clients",
        element: (
          <PermissionGuard requiredPermissions={[permissions.viewClients]}>
            <ClientsPage />
          </PermissionGuard>
        ),
      },
      {
        path: "clients/new",
        element: (
          <PermissionGuard requiredPermissions={[permissions.manageClients]}>
            <ClientCreatePage />
          </PermissionGuard>
        ),
      },
      {
        path: "clients/:clientId",
        element: (
          <PermissionGuard requiredPermissions={[permissions.viewClients]}>
            <ClientDetailPage />
          </PermissionGuard>
        ),
      },
      {
        path: "clients/:clientId/edit",
        element: (
          <PermissionGuard requiredPermissions={[permissions.manageClients]}>
            <ClientEditPage />
          </PermissionGuard>
        ),
      },
      { path: "materials", element: <MaterialsPage /> },
      {
        path: "materials/new",
        element: <MaterialCreatePage />,
      },
      {
        path: "materials/:materialId",
        element: <MaterialDetailPage />,
      },
      {
        path: "materials/:materialId/edit",
        element: <MaterialEditPage />,
      },
      {
        path: "trips",
        element: (
          <PermissionGuard requiredPermissions={[permissions.viewTrips]}>
            <TripsPage />
          </PermissionGuard>
        ),
      },
      {
        path: "trips/new",
        element: (
          <PermissionGuard requiredPermissions={[permissions.manageTrips]}>
            <TripCreatePage />
          </PermissionGuard>
        ),
      },
      {
        path: "trips/:tripId",
        element: (
          <PermissionGuard requiredPermissions={[permissions.viewTrips]}>
            <TripDetailPage />
          </PermissionGuard>
        ),
      },
      {
        path: "trips/:tripId/edit",
        element: (
          <PermissionGuard requiredPermissions={[permissions.manageTrips]}>
            <TripEditPage />
          </PermissionGuard>
        ),
      },
      { path: "rules", element: <RulesPage /> },
      { path: "cess", element: <CessPage /> },
      {
        path: "stores",
        element: (
          <PermissionGuard requiredPermissions={[permissions.viewStores]}>
            <StoresPage />
          </PermissionGuard>
        ),
      },
      {
        path: "stores/receivings",
        element: (
          <PermissionGuard requiredPermissions={[permissions.viewStores]}>
            <StoresPage />
          </PermissionGuard>
        ),
      },
      {
        path: "stores/requisitions",
        element: (
          <PermissionGuard requiredPermissions={[permissions.viewStores]}>
            <StoresPage />
          </PermissionGuard>
        ),
      },
      {
        path: "stores/issues",
        element: (
          <PermissionGuard requiredPermissions={[permissions.viewStores]}>
            <StoresPage />
          </PermissionGuard>
        ),
      },
      {
        path: "stores/adjustments",
        element: (
          <PermissionGuard requiredPermissions={[permissions.viewStores]}>
            <StoresPage />
          </PermissionGuard>
        ),
      },
      {
        path: "stores/purchase-orders",
        element: (
          <PermissionGuard requiredPermissions={[permissions.viewStores]}>
            <StoresPage />
          </PermissionGuard>
        ),
      },
      {
        path: "stores/suppliers",
        element: (
          <PermissionGuard requiredPermissions={[permissions.viewStores]}>
            <StoresPage />
          </PermissionGuard>
        ),
      },
      {
        path: "fuel",
        element: (
          <PermissionGuard requiredPermissions={[permissions.viewFuel]}>
            <FuelPage />
          </PermissionGuard>
        ),
      },
      {
        path: "fuel/stations",
        element: (
          <PermissionGuard requiredPermissions={[permissions.viewFuel]}>
            <FuelPage />
          </PermissionGuard>
        ),
      },
      {
        path: "fuel/consumption",
        element: (
          <PermissionGuard requiredPermissions={[permissions.viewFuel]}>
            <FuelPage />
          </PermissionGuard>
        ),
      },
      {
        path: "maintenance",
        element: (
          <PermissionGuard requiredPermissions={[permissions.viewMaintenance]}>
            <MaintenancePage />
          </PermissionGuard>
        ),
      },
      {
        path: "maintenance/mechanics",
        element: (
          <PermissionGuard requiredPermissions={[permissions.viewMaintenance]}>
            <MaintenancePage />
          </PermissionGuard>
        ),
      },
      {
        path: "maintenance/service-records",
        element: (
          <PermissionGuard requiredPermissions={[permissions.viewMaintenance]}>
            <MaintenancePage />
          </PermissionGuard>
        ),
      },
      {
        path: "maintenance/parts-used",
        element: (
          <PermissionGuard requiredPermissions={[permissions.viewMaintenance]}>
            <MaintenancePage />
          </PermissionGuard>
        ),
      },
      {
        path: "payroll",
        element: (
          <PermissionGuard requiredPermissions={[permissions.viewPayroll]}>
            <PayrollPage />
          </PermissionGuard>
        ),
      },
      { path: "reports", element: <ReportsPage /> },
      { path: "notifications", element: <NotificationsPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
