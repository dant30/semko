import { permissions } from "@/core/constants/permissions";
import { appRoutes } from "@/core/constants/routes";
import type { NavItem } from "@/core/types/common";

export const mainNavigation: NavItem[] = [
  { label: "Dashboard", path: appRoutes.dashboard, icon: "grid" },
  {
    label: "Trips",
    path: appRoutes.trips,
    icon: "route",
    requiredPermissions: [permissions.viewTrips],
    children: [
      {
        label: "Trip register",
        path: appRoutes.trips,
        requiredPermissions: [permissions.viewTrips],
      },
      {
        label: "Create trip",
        path: appRoutes.tripCreate,
        requiredPermissions: [permissions.manageTrips],
      },
    ],
  },
  {
    label: "Stores",
    path: appRoutes.stores,
    icon: "boxes",
    requiredPermissions: [permissions.viewStores],
    children: [
      {
        label: "Items",
        path: appRoutes.stores,
        requiredPermissions: [permissions.viewStores],
      },
      {
        label: "Receivings",
        path: appRoutes.storesReceivings,
        requiredPermissions: [permissions.viewStores],
      },
      {
        label: "Requisitions",
        path: appRoutes.storesRequisitions,
        requiredPermissions: [permissions.viewStores],
      },
      {
        label: "Stock issues",
        path: appRoutes.storesIssues,
        requiredPermissions: [permissions.viewStores],
      },
      {
        label: "Adjustments",
        path: appRoutes.storesAdjustments,
        requiredPermissions: [permissions.viewStores],
      },
      {
        label: "Purchase orders",
        path: appRoutes.storesPurchaseOrders,
        requiredPermissions: [permissions.viewStores],
      },
      {
        label: "Suppliers",
        path: appRoutes.storesSuppliers,
        requiredPermissions: [permissions.viewStores],
      },
    ],
  },
  {
    label: "Fuel",
    path: appRoutes.fuel,
    icon: "droplet",
    requiredPermissions: [permissions.viewFuel],
    children: [
      {
        label: "Transactions",
        path: appRoutes.fuel,
        requiredPermissions: [permissions.viewFuel],
      },
      {
        label: "Stations",
        path: appRoutes.fuelStations,
        requiredPermissions: [permissions.viewFuel],
      },
      {
        label: "Consumption",
        path: appRoutes.fuelConsumption,
        requiredPermissions: [permissions.viewFuel],
      },
    ],
  },
  {
    label: "Maintenance",
    path: appRoutes.maintenance,
    icon: "wrench",
    requiredPermissions: [permissions.viewMaintenance],
    children: [
      {
        label: "Schedules",
        path: appRoutes.maintenance,
        requiredPermissions: [permissions.viewMaintenance],
      },
      {
        label: "Mechanics",
        path: appRoutes.maintenanceMechanics,
        requiredPermissions: [permissions.viewMaintenance],
      },
      {
        label: "Service records",
        path: appRoutes.maintenanceServiceRecords,
        requiredPermissions: [permissions.viewMaintenance],
      },
      {
        label: "Parts used",
        path: appRoutes.maintenancePartsUsed,
        requiredPermissions: [permissions.viewMaintenance],
      },
    ],
  },
  {
    label: "Payroll",
    path: appRoutes.payroll,
    icon: "wallet",
    requiredPermissions: [permissions.viewPayroll],
    children: [
      {
        label: "Payroll workspace",
        path: appRoutes.payroll,
        requiredPermissions: [permissions.viewPayroll],
      },
      {
        label: "Payroll periods",
        path: appRoutes.payroll,
        requiredPermissions: [permissions.viewPayroll],
      },
      {
        label: "Create payroll period",
        path: appRoutes.payroll,
        requiredPermissions: [permissions.managePayroll],
      },
    ],
  },
  { label: "Reports", path: appRoutes.reports, icon: "chart" },
  { label: "Notifications", path: appRoutes.notifications, icon: "bell" },
  { label: "Support", path: appRoutes.support, icon: "help" },
];

export const masterDataNavigation: NavItem[] = [
  {
    label: "Vehicles",
    path: appRoutes.vehicles,
    icon: "vehicle",
    requiredPermissions: [permissions.viewVehicles],
    children: [
      {
        label: "Fleet register",
        path: appRoutes.vehicles,
        requiredPermissions: [permissions.viewVehicles],
      },
      {
        label: "Vehicle types",
        path: appRoutes.vehicleTypes,
        requiredPermissions: [permissions.viewVehicles],
      },
      {
        label: "Ownerships",
        path: appRoutes.vehicleOwnerships,
        requiredPermissions: [permissions.viewVehicles],
      },
    ],
  },
  {
    label: "Drivers",
    path: appRoutes.drivers,
    icon: "user",
    requiredPermissions: [permissions.viewDrivers],
    children: [
      {
        label: "Driver register",
        path: appRoutes.drivers,
        requiredPermissions: [permissions.viewDrivers],
      },
      {
        label: "New driver",
        path: appRoutes.driverCreate,
        requiredPermissions: [permissions.manageDrivers],
      },
      {
        label: "License watch",
        path: appRoutes.driverLicenses,
        requiredPermissions: [permissions.viewDrivers],
      },
    ],
  },
  {
    label: "Clients",
    path: appRoutes.clients,
    icon: "users",
    requiredPermissions: [permissions.viewClients],
    children: [
      {
        label: "Client register",
        path: appRoutes.clients,
      },
      {
        label: "New client",
        path: appRoutes.clientCreate,
        requiredPermissions: [permissions.manageClients],
      },
    ],
  },
  {
    label: "Materials",
    path: appRoutes.materials,
    children: [
      {
        label: "Materials register",
        path: appRoutes.materials,
      },
      {
        label: "New material",
        path: appRoutes.materialCreate,
      },
    ],
  },
];

export const governanceNavigation: NavItem[] = [
  {
    label: "Users",
    path: appRoutes.users,
    icon: "users",
    requiredPermissions: [permissions.viewUsers],
    children: [
      {
        label: "User register",
        path: appRoutes.users,
        requiredPermissions: [permissions.viewUsers],
      },
      {
        label: "New user",
        path: appRoutes.userCreate,
        requiredPermissions: [permissions.manageUsers],
      },
    ],
  },
  {
    label: "Roles",
    path: appRoutes.roles,
    requiredPermissions: [permissions.viewRoles],
  },
  {
    label: "Audit",
    path: appRoutes.audit,
    requiredPermissions: [permissions.viewAudit],
  },
  { label: "Rules", path: appRoutes.rules },
  { label: "Cess", path: appRoutes.cess },
  { label: "Settings", path: appRoutes.settings },
];

export const routePrefetchMap: Record<string, () => Promise<unknown>> = {
  "/login": () => import("@/features/auth"),
  "/app/dashboard": () => import("@/features/dashboard"),
  "/app/users": () => import("@/features/users"),
  "/app/roles": () => import("@/features/roles"),
  "/app/audit": () => import("@/features/audit"),
  "/app/vehicles": () => import("@/features/vehicles"),
  "/app/drivers": () => import("@/features/drivers"),
  "/app/drivers/new": () => import("@/features/drivers"),
  "/app/clients": () => import("@/features/clients"),
  "/app/materials": () => import("@/features/materials"),
  "/app/materials/new": () => import("@/features/materials"),
  "/app/trips": () => import("@/features/trips"),
  "/app/rules": () => import("@/features/rules"),
  "/app/cess": () => import("@/features/cess"),
  "/app/stores": () => import("@/features/stores"),
  "/app/fuel": () => import("@/features/fuel"),
  "/app/maintenance": () => import("@/features/maintenance"),
  "/app/payroll": () => import("@/features/payroll"),
  "/app/reports": () => import("@/features/reports"),
  "/app/notifications": () => import("@/features/notifications"),
  "/app/settings": () => import("@/features/settings"),
  "/app/profile": () => import("@/features/users"),
  "/app/password/change": () => import("@/features/auth"),
  "/unauthorized": () => import("@/features/unauthorized"),
  "/support": () => import("@/features/support"),
  "/docs": () => import("@/features/docs"),
  "/legal": () => import("@/features/legal"),
};

export function prefetchRoute(path: string) {
  const normalized = path.replace(/\?.*$/, "").replace(/\/$/, "");

  for (const [route, importer] of Object.entries(routePrefetchMap)) {
    if (route === normalized || normalized.startsWith(`${route}/`)) {
      importer().catch(() => {
        // best-effort prefetch, no user-facing error path
      });
      break;
    }
  }
}
