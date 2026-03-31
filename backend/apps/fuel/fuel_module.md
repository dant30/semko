Fuel Module Documentation
1. Module Overview
The fuel app manages all fuel-related operations for the fleet. It currently supports:

Fuel Stations – internal/external supply points (CRUD).

Fuel Transactions – manual refueling events (recorded per vehicle, driver, trip).

Fuel Consumption Periods – track efficiency (km/l, l/100km) over odometer ranges.

The module is fully integrated with the frontend fuel workspace, providing a unified interface for fuel data entry and reporting.

Future Enhancements (planned / in development):

Fuel Card management (fleet cards with budgets & restrictions)

Automated import from fuel card providers (CSV/API)

ERP integration (export to GL codes, auto‑journal entries)

2. Data Models
All models are defined in apps/fuel/models.py.

2.1 FuelStation
python
class FuelStation(TimeStampedModel):
    class StationType(models.TextChoices):
        INTERNAL = "internal", "Internal"
        EXTERNAL = "external", "External"

    name = models.CharField(max_length=150, unique=True)
    code = models.SlugField(max_length=100, unique=True)
    station_type = models.CharField(max_length=20, choices=StationType.choices)
    location = models.CharField(max_length=255, blank=True)
    contact_person = models.CharField(max_length=150, blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    is_active = models.BooleanField(default=True)
Note: Soft deletion is implemented by setting is_active=False.

2.2 FuelTransaction
python
class FuelTransaction(TimeStampedModel):
    class FuelType(models.TextChoices):
        DIESEL = "diesel", "Diesel"
        PETROL = "petrol", "Petrol"
        KEROSENE = "kerosene", "Kerosene"
        OTHER = "other", "Other"

    class PaymentMethod(models.TextChoices):
        CASH = "cash", "Cash"
        CREDIT = "credit", "Credit"
        FUEL_CARD = "fuel_card", "Fuel Card"
        VOUCHER = "voucher", "Voucher"
        INTERNAL = "internal", "Internal"

    reference_no = models.CharField(max_length=50, unique=True)
    transaction_date = models.DateField()
    vehicle = models.ForeignKey("vehicles.Vehicle", on_delete=models.PROTECT, related_name="fuel_transactions")
    driver = models.ForeignKey("drivers.Driver", on_delete=models.PROTECT, null=True, blank=True, related_name="fuel_transactions")
    trip = models.ForeignKey("trips.Trip", on_delete=models.SET_NULL, null=True, blank=True, related_name="fuel_transactions")
    station = models.ForeignKey(FuelStation, on_delete=models.PROTECT, related_name="transactions")
    fuel_type = models.CharField(max_length=20, choices=FuelType.choices)
    litres = models.DecimalField(max_digits=12, decimal_places=2)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    total_cost = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    odometer_reading = models.DecimalField(max_digits=12, decimal_places=2)
    full_tank = models.BooleanField(default=False)
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
Validation & Business Logic:

clean() ensures litres > 0, unit_price > 0, odometer_reading ≥ 0, and that the trip belongs to the same vehicle.

save() automatically computes total_cost = litres * unit_price.

2.3 FuelConsumption
python
class FuelConsumption(TimeStampedModel):
    vehicle = models.ForeignKey("vehicles.Vehicle", on_delete=models.PROTECT, related_name="fuel_consumptions")
    period_start = models.DateField()
    period_end = models.DateField()
    opening_odometer = models.DecimalField(max_digits=12, decimal_places=2)
    closing_odometer = models.DecimalField(max_digits=12, decimal_places=2)
    total_litres = models.DecimalField(max_digits=12, decimal_places=2)
    total_cost = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    distance_covered = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    km_per_litre = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    litres_per_100km = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ("vehicle", "period_start", "period_end")
Calculation:

distance_covered = closing_odometer - opening_odometer

km_per_litre = distance_covered / total_litres (if litres > 0)

litres_per_100km = (total_litres / distance_covered) * 100 (if distance_covered > 0)

These are computed in the save() method.

3. API Endpoints
All endpoints are prefixed with /api/fuel/. Permissions are enforced using HasRolePermissions with RolePermissionCodes.VIEW_FUEL (GET) and RolePermissionCodes.MANAGE_FUEL (POST/PUT/PATCH/DELETE).

Endpoint	Method	Description
/stations/	GET	List stations (supports search, active_only, station_type)
/stations/	POST	Create a new station
/stations/<id>/	GET	Retrieve a station
/stations/<id>/	PUT/PATCH	Update a station
/stations/<id>/	DELETE	Deactivate a station (sets is_active=False)
/	GET	List transactions (supports vehicle_id, station_id, fuel_type, active_only)
/	POST	Create a transaction
/<id>/	GET	Retrieve a transaction
/<id>/	PUT/PATCH	Update a transaction
/<id>/	DELETE	Deactivate a transaction
/consumptions/	GET	List consumption periods (supports vehicle_id, active_only)
/consumptions/	POST	Create a consumption period
/consumptions/<id>/	GET	Retrieve a consumption period
/consumptions/<id>/	PUT/PATCH	Update a consumption period
/consumptions/<id>/	DELETE	Deactivate a consumption period
Note: The API does not currently expose endpoints for:

Summary metrics (computed on the frontend from fetched data)

Lookups (vehicles, drivers, trips, stations – provided by other apps)

Fuel cards, import/export, or ERP integration (planned)

4. Serializers
FuelStationSerializer – read-only, includes all fields.

FuelStationWriteSerializer – write‑only, excludes read‑only timestamps.

FuelTransactionSerializer – read‑only, includes related names (vehicle_registration, driver_name, station_name, trip_number).

FuelTransactionWriteSerializer – accepts vehicle_id, driver_id, trip_id, station_id and performs cross‑field validation (trip belongs to vehicle, etc.).

FuelConsumptionSerializer – read‑only, includes vehicle_registration.

FuelConsumptionWriteSerializer – accepts vehicle_id and passes data to calculate_efficiency_metrics to fill computed fields.

The helper calculate_efficiency_metrics (in calculators/efficiency.py) performs the efficiency calculations and returns distance_covered, km_per_litre, litres_per_100km, and total_cost.

5. Business Logic & Validation
FuelTransaction:

clean() validates litres > 0, unit_price > 0, odometer_reading ≥ 0, and trip/vehicle consistency.

save() automatically calculates total_cost.

FuelConsumption:

clean() ensures period_end ≥ period_start, closing_odometer ≥ opening_odometer, and total_litres > 0.

save() computes efficiency metrics.

Soft Deletion: All DELETE operations set is_active=False; records are not physically removed.

6. Frontend Integration
The frontend (React + Tailwind) consumes the API via the fuelApi service. Key components:

FuelPage – main container with tabs (Transactions, Stations, Consumption).

FuelSummaryCards – displays KPIs (active stations, total fuel volume, spend, full tank fills, consumption periods, avg km/l). Metrics are calculated on the frontend using buildFuelSummaryMetrics().

FuelTransactionsTable – reusable table for all list views.

FuelViewTabs – navigation between views.

FuelStationFormCard, FuelTransactionFormCard, FuelConsumptionFormCard – forms for creating records.

useFuelWorkspace – custom hook that fetches data, manages forms, and handles submissions.

The frontend fetches lookups (vehicles, drivers, trips, stations) from separate endpoints (e.g., /vehicles/, /drivers/, /trips/, /fuel/stations/). These are combined in fuelApi.fetchLookups().

7. Testing & Coverage
7.1 Unit Tests (planned)
Model validation tests (e.g., negative litres, trip consistency)

Serializer tests (field validation, computed fields)

View tests (permissions, filtering, soft delete)

7.2 Integration Tests (planned)
Full workflow: create station → create transaction → create consumption period

API response structure tests

8. Future Enhancements (Roadmap)
Feature	Description	Status
Fuel Cards	Model FuelCard (card number, provider, assigned vehicle/driver, budget limit). Add foreign key to FuelTransaction and validation.	Planned
Import from providers	Endpoint /transactions/import/ to accept CSV/JSON from fuel card providers. Map to internal format and create/update transactions.	Planned
ERP Export	Endpoint /transactions/export/ to generate CSV with GL codes. Derive GL accounts from vehicle department, station type, fuel type.	Planned
Scheduled Imports	Celery Beat task to pull transactions from provider APIs daily.	Planned
Summary API	Backend endpoint to compute summary metrics (active stations, total fuel, etc.) for performance.	Optional (frontend currently computes)
Odometer Validation	Compare new odometer reading with last recorded value for the vehicle; warn if lower.	Planned
Budget Tracking	Track remaining budget per fuel card and reject transactions exceeding limit.	Planned
9. Maintenance & Updates
Update this document whenever models, endpoints, or major features change.

Keep a changelog in the same file or in a separate CHANGELOG.md.

Last Updated: 2026-03-31