import { combineReducers } from "@reduxjs/toolkit";

import authReducer from "@/features/auth/store/auth.slice";
import dashboardReducer from "@/features/dashboard/store/dashboard.slice";
import driversReducer from "@/features/drivers/store/drivers.slice";
import fuelReducer from "@/features/fuel/store/fuel.slice";
import maintenanceReducer from "@/features/maintenance/store/maintenance.slice";
import payrollReducer from "@/features/payroll/store/payroll.slice";
import notificationsReducer from "@/features/notifications/store/notifications.slice";
import storesReducer from "@/features/stores/store/stores.slice";
import tripsReducer from "@/features/trips/store/trips.slice";
import rolesReducer from "@/features/roles/store/roles.slice";
import usersReducer from "@/features/users/store/users.slice";
import vehiclesReducer from "@/features/vehicles/store/vehicles.slice";
import materialsReducer from "@/features/materials/store/materials.slice";
import clientsReducer from "@/features/clients/store/clients.slice";
import reportsReducer from "@/features/reports/store/reports.slice";

export const rootReducer = combineReducers({
  auth: authReducer,
  dashboard: dashboardReducer,
  drivers: driversReducer,
  fuel: fuelReducer,
  maintenance: maintenanceReducer,
  payroll: payrollReducer,
  notifications: notificationsReducer,
  roles: rolesReducer,
  stores: storesReducer,
  trips: tripsReducer,
  users: usersReducer,
  vehicles: vehiclesReducer,
  materials: materialsReducer,
  clients: clientsReducer,
  reports: reportsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
