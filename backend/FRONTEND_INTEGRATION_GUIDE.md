# SEMKO Backend Frontend Integration Guide

This guide is intended for frontend engineers building the React application against the SEMKO backend.
It captures authentication flow, permission model, API structure, resource relationships, and practical examples.

## 1. Base Configuration

Base URL:
- Development: `http://localhost:8000`
- Production: `https://www.semko.co.ke`

API prefixes:
- Modern: `/api/v1/`
- Legacy: `/api/`

Prefer `/api/v1/` for new frontend development. Legacy routes are available for compatibility.

## 2. Common HTTP Headers

Required headers:
- `Authorization: Bearer <access_token>`
- `Content-Type: application/json`
- `Accept: application/json`

For file uploads use `Content-Type: multipart/form-data`.

## 3. Response Formats

### Standardized core responses
Core endpoints in `apps.core.views.api` use a standardized response wrapper:
```json
{ "success": true, "data": { ... } }
```

### DRF default responses
Other DRF endpoints typically return raw list/object payloads or:
```json
{ "detail": "..." }
```

### Validation errors
```json
{ "field_name": ["error message"] }
```

### Permission errors
```json
{ "detail": "You do not have permission to perform this action." }
```

## 4. Authentication & Token Lifecycle

### Token types
- `access` token: 15 minutes lifetime
- `refresh` token: 7 days lifetime

### Storage recommendations
- Store `access_token` in memory/state when possible
- Store `refresh_token` in secure storage (localStorage or cookie)
- Do not keep long-lived access tokens in localStorage if avoidable

### Security behavior
- `logout` and `password change` blacklist tokens
- Old tokens are invalidated after password change
- Frontend should redirect to login after logout or password reset

## 5. Authentication Endpoints

Expected endpoints in `apps.users.urls`:

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/v1/users/register/` | POST | Public registration if enabled |
| `/api/v1/users/login/` | POST | Obtain access + refresh tokens |
| `/api/v1/users/token/refresh/` | POST | Refresh access token |
| `/api/v1/users/logout/` | POST | Blacklist refresh token |
| `/api/v1/users/password/change/` | PATCH | Change password |
| `/api/v1/users/password/forgot/` | POST | Request password reset email |
| `/api/v1/users/password/reset/` | POST | Reset password with token |
| `/api/v1/users/me/` | GET / PATCH | Get or update current profile |

### Notes
- `role_id` is optional during registration
- If omitted, the user may be created without a role
- After password change, invalidate local auth state and require re-login

## 6. Role-Based Permission Model

Permission checks live in `apps.core.permissions`.
A role is attached to the user and grants permission codes.

### Superusers
- bypass all permission checks

### Permission helper
- `user_has_role_permission(user, permission_code)`

### View permissions guard
- `HasRolePermissions` reads `view.required_permissions_by_method` from the view

### Permission codes
Key codes from `apps.core.constants.RolePermissionCodes`:

- `core.view_dashboard`
- `users.view_user`
- `users.manage_user`
- `users.view_role`
- `users.manage_role`
- `drivers.view_driver`
- `drivers.manage_driver`
- `vehicles.view_vehicle`
- `vehicles.manage_vehicle`
- `stores.view_store`
- `stores.manage_store`
- `trips.view_trip`
- `trips.manage_trip`
- `fuel.view_fuel`
- `fuel.manage_fuel`
- `maintenance.view_maintenance`
- `maintenance.manage_maintenance`
- `payroll.view_payroll`
- `payroll.manage_payroll`
- `notifications.view_notification`
- `notifications.manage_notification`
- `audit.view_log`
- `rules.view_rule`
- `rules.manage_rule`
- `cess.view_cess`
- `cess.manage_cess`
- `stores.view_purchase_order`
- `stores.manage_purchase_order`

### Frontend usage
Store the user's effective permissions after login and use them for UI gating.

Example:
```js
const canViewUsers = permissions.includes('users.view_user');
const canManageTrips = permissions.includes('trips.manage_trip');
```

## 7. Core System Endpoints

Configured in `backend/semko/urls.py`:
- `/api/v1/core/health/`
- `/api/v1/core/dashboard/summary/`

### Health Check
- `/api/v1/core/health/`
- Method: `GET`
- Permission: `AllowAny`
- Description: Service health check endpoint
- Response format:
  ```json
  { "success": true, "data": { "status": "ok", "service": "semko-backend", "app": "core" } }
  ```

### Dashboard Summary
- `/api/v1/core/dashboard/summary/`
- Method: `GET`
- Permission: `core.view_dashboard`
- Description: KPI summary for dashboard cards and alerts
- Response format:
  ```json
  { "success": true, "data": { ... } }
  ```

### Dashboard Summary Response Fields
- `total_inventory_items` — int — Total active items
- `low_stock_items` — int — Items below reorder level
- `trips_today` — int — Trips scheduled for today
- `trips_this_week` — int — Trips this week (Monday–Sunday)
- `fuel_today_litres` — decimal — Fuel litres consumed today
- `fuel_this_month_litres` — decimal — Fuel litres consumed this month
- `previous_total_inventory_items` — int — Currently same as current total inventory
- `previous_low_stock_items` — int — Currently same as current low stock count
- `previous_trips_today` — int — Trips yesterday
- `previous_trips_this_week` — int — Trips previous week
- `previous_fuel_today_litres` — decimal — Fuel litres yesterday
- `previous_fuel_this_month_litres` — decimal — Fuel litres previous month
- `active_vehicles` — int — Vehicles with `ACTIVE` status
- `overdue_maintenance` — int — Maintenance schedules with `OVERDUE` status
- `pending_requisitions` — int — Requisitions awaiting approval
- `previous_active_vehicles` — int — Currently same as current value
- `previous_overdue_maintenance` — int — Currently same as current value
- `previous_pending_requisitions` — int — Currently same as current value
- `alerts` — array — List of alert objects

### Alert object
- `type`: `info` | `success` | `warning` | `danger`
- `title`: string
- `count`: int
- `url`: string

Example:
```json
{
  "type": "warning",
  "title": "Low stock items",
  "count": 3,
  "url": "/stores?view=low-stock"
}
```

> Note: several `previous_*` fields are currently duplicates of the current values. For now, use the `previous_*` fields as placeholders for week-over-week or month-over-month comparisons where they differ.

## 8. Core Utility Helpers

The backend exposes reusable utility helpers in `apps/core/utils/`. These are server-side helpers, but the frontend can mirror them for consistent behavior.

### Date utilities (`apps/core/utils/date_utils.py`)
- `today()` — current date in `Africa/Nairobi`
- `now()` — current timezone-aware datetime
- `start_of_day(date)`, `end_of_day(date)`
- `start_of_week(date)`, `end_of_week(date)`
- `start_of_month(date)`, `end_of_month(date)`
- `days_between(start, end)`
- `is_today(date)`

Frontend equivalent using `date-fns` / `date-fns-tz`:
```js
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, differenceInDays, isToday } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz'
const timeZone = 'Africa/Nairobi'
const today = utcToZonedTime(new Date(), timeZone)
```

### Formatters (`apps/core/utils/formatters.py`)
- `format_decimal(value, precision=2)` → `"1,234.56"`
- `format_currency(value, symbol="$")` → `"$1,234.56"`
- `format_percentage(value, precision=2)` → `"12.34%"`
- `format_duration(seconds)` → `"2h 30m 15s"`
- `format_date(date)` → `"2025-03-15"`
- `format_datetime(datetime)` → `"2025-03-15 14:30:00"`

Frontend can use `Intl.NumberFormat` and `Intl.DateTimeFormat` for these.

### Helpers (`apps/core/utils/helpers.py`)
- `compact_dict(obj)` — remove null/empty values
- `chunked(array, size)` — split an array into chunks
- `coerce_bool(value)` — convert `"true"/"1"/"yes"` to boolean
- `ensure_list(value)` — wrap non-array values into an array

### Validators (`apps/core/utils/validators.py`)
- `validate_non_empty_string`
- `validate_positive_int`
- `validate_email`
- `validate_date_string`
- `validate_choice`

Use these validator concepts in frontend form validation before making requests.

## 9. User Management Endpoints

Expected endpoints under `/api/v1/users/`:

| Endpoint | Method | Permissions | Purpose |
|---|---|---|---|
| `/api/v1/users/` | GET | `users.view_user` | List users |
| `/api/v1/users/` | POST | `users.manage_user` | Create user |
| `/api/v1/users/{id}/` | GET | `users.view_user` | Retrieve user |
| `/api/v1/users/{id}/` | PUT | `users.manage_user` | Full update |
| `/api/v1/users/{id}/` | PATCH | `users.manage_user` | Partial update |
| `/api/v1/users/{id}/` | DELETE | `users.manage_user` | Soft delete |
| `/api/v1/users/roles/` | GET | `users.view_role` | List roles |
| `/api/v1/users/roles/` | POST | `users.manage_role` | Create role |
| `/api/v1/users/roles/{id}/` | GET | `users.view_role` | Retrieve role |
| `/api/v1/users/roles/{id}/` | PUT/PATCH | `users.manage_role` | Update role |
| `/api/v1/users/roles/{id}/` | DELETE | `users.manage_role` | Delete role |

### Business rules to enforce in UI
- User delete is soft: use `is_active` or filter inactive records
- Do not allow users to deactivate themselves
- Do not allow deletion of system roles (`is_system=True`)
- Do not allow deletion of roles assigned to users

## 10. Driver Management Endpoints

Supported endpoints in `backend/apps/drivers/urls.py`:

| Endpoint | Method | Permissions | Purpose |
|---|---|---|---|
| `/api/v1/drivers/` | GET | `drivers.view_driver` | List drivers |
| `/api/v1/drivers/` | POST | `drivers.manage_driver` | Create driver |
| `/api/v1/drivers/{id}/` | GET | `drivers.view_driver` | Retrieve driver |
| `/api/v1/drivers/{id}/` | PUT/PATCH | `drivers.manage_driver` | Update driver |
| `/api/v1/drivers/{id}/` | DELETE | `drivers.manage_driver` | Soft delete driver |
| `/api/v1/drivers/licenses/{id}/` | GET | `drivers.view_driver` | Retrieve license |
| `/api/v1/drivers/licenses/{id}/` | PUT | `drivers.manage_driver` | Update license |

### Driver model relationships
- `Driver` has optional one-to-one `user` link
- `Driver` has one-to-one `DriverLicense`

### Suggested filters
- `search=text`
- `active_only=true`
- `license_status=valid|expired|suspended|revoked`
- `employment_status=active|on_leave|suspended|terminated`

## 11. Module Patterns for CRUD Endpoints

The backend uses consistent patterns across apps:
- List endpoints support `?search=` and `?active_only=true`
- Detail endpoints support GET / PUT / PATCH / DELETE
- Most deletes are soft deletes: set `is_active=False`
- Permission checks require view/manage permission codes
- File uploads use multipart form data

### Common module endpoints
| Module | Base route |
|---|---|
| Vehicles | `/api/v1/vehicles/` |
| Trips | `/api/v1/trips/` |
| Stores | `/api/v1/stores/` |
| Fuel | `/api/v1/fuel/` |
| Maintenance | `/api/v1/maintenance/` |
| Cess | `/api/v1/cess/` |
| Payroll | `/api/v1/payroll/` |
| Rules | `/api/v1/rules/` |
| Audit | `/api/v1/audit/` |
| Reports | `/api/v1/reports/` |
| Notifications | `/api/v1/notifications/` |

## 12. Data Model Summary

### User
Fields likely present:
- `id`
- `username`
- `email`
- `first_name`
- `last_name`
- `phone_number`
- `role`
- `is_active`
- `is_superuser`
- `effective_permissions`

### Role
- `name`
- `code`
- `permissions`
- `description`
- `is_system`

### Driver
- `employee_id`
- `user` (nullable relation)
- `first_name`
- `last_name`
- `national_id`
- `phone_number`
- `date_of_birth`
- `hire_date`
- `employment_status`
- `is_active`
- `license`

### DriverLicense
- `license_number`
- `license_class`
- `issue_date`
- `expiry_date`
- `status`
- `issuing_authority`

## 12. Frontend Integration Examples

### Axios config with refresh support
```js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1/',
});

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const refreshToken = window.localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/v1/users/token/refresh/', {
            refresh: refreshToken,
          });
          window.localStorage.setItem('access_token', data.access);
          api.defaults.headers.common.Authorization = `Bearer ${data.access}`;
          return api(originalRequest);
        } catch (refreshError) {
          window.localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Login flow
```js
async function login(username, password) {
  const response = await api.post('users/login/', { username, password });
  localStorage.setItem('access_token', response.data.access);
  localStorage.setItem('refresh_token', response.data.refresh);
  const profile = await api.get('users/me/');
  return profile.data;
}
```

### Fetching drivers with filters
```js
async function fetchDrivers({ search, activeOnly, licenseStatus }) {
  const params = {};
  if (search) params.search = search;
  if (activeOnly) params.active_only = 'true';
  if (licenseStatus) params.license_status = licenseStatus;
  return api.get('drivers/', { params });
}
```

## 13. Best Practices & Hardening

- Use permission codes from `/me` to drive UI state and route access
- Call `/api/v1/users/logout/` on sign-out to blacklist refresh tokens
- Force login after password change
- Avoid deleting frontend state before backend confirms success
- Represent inactive/soft-deleted records clearly in UI
- Use `page` and `page_size` for paginated list endpoints
- Display server validation errors field-by-field

## 14. Recommended Frontend Workflows

- Build a permission-aware navigation system
- Prefer `/api/v1/` for new features
- Provide a UX path for maintenance, trips, stores, fuel, and payroll workflows
- Use feature flags for early rollout of role-based UI elements
- Keep legacy `api/` support only for existing clients

## 15. How to extend the backend contract

When adding new backend resources:
- Add a DRF view/viewset with explicit permission classes
- Register it under `backend/semko/urls.py`
- Expose it under `/api/v1/<module>/`
- Add frontend interfaces only after the endpoint is stable
- Keep the same `success` wrapper for new core data endpoints

---

This guide is designed to be shared with your React teammate as the authoritative contract between frontend and backend.
