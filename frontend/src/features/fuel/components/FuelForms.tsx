import type { Dispatch, ReactNode, SetStateAction } from "react";

import type {
  FuelConsumptionFormValues,
  FuelPaymentMethod,
  FuelStationFormValues,
  FuelStationType,
  FuelTransactionFormValues,
  FuelType,
} from "@/features/fuel/types/fuel";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

interface LookupOption {
  id: number;
  label: string;
  subtitle?: string;
}

function FormField({ children, label }: { children: ReactNode; label: string }) {
  return (
    <label className="form-group">
      <span className="form-label">{label}</span>
      {children}
    </label>
  );
}

function LookupSelect({
  onChange,
  options,
  placeholder,
  value,
}: {
  onChange: (value: string) => void;
  options: LookupOption[];
  placeholder: string;
  value: string;
}) {
  return (
    <select className="form-select" onChange={(event) => onChange(event.target.value)} value={value}>
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.id} value={String(option.id)}>
          {option.label}
          {option.subtitle ? ` - ${option.subtitle}` : ""}
        </option>
      ))}
    </select>
  );
}

export function FuelStationFormCard({
  form,
  onSubmit,
  setForm,
  submitting,
}: {
  form: FuelStationFormValues;
  onSubmit: () => void;
  setForm: Dispatch<SetStateAction<FuelStationFormValues>>;
  submitting: boolean;
}) {
  const types: FuelStationType[] = ["internal", "external"];

  return (
    <Card className="rounded-[2rem] p-6">
      <div className="mb-5">
        <h3>Fuel station</h3>
        <p className="mt-2 text-sm">Register internal or external fuel supply points.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Station name">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} value={form.name} />
        </FormField>
        <FormField label="Station code">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))} value={form.code} />
        </FormField>
        <FormField label="Station type">
          <select className="form-select" onChange={(event) => setForm((current) => ({ ...current, station_type: event.target.value as FuelStationType }))} value={form.station_type}>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Location">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} value={form.location} />
        </FormField>
        <FormField label="Contact person">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, contact_person: event.target.value }))} value={form.contact_person} />
        </FormField>
        <FormField label="Contact phone">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, contact_phone: event.target.value }))} value={form.contact_phone} />
        </FormField>
      </div>
      <div className="mt-5 flex justify-end">
        <Button disabled={submitting} onClick={onSubmit} type="button">
          {submitting ? "Saving..." : "Create station"}
        </Button>
      </div>
    </Card>
  );
}

export function FuelTransactionFormCard({
  drivers,
  form,
  onSubmit,
  setForm,
  stations,
  submitting,
  trips,
  vehicles,
}: {
  drivers: LookupOption[];
  form: FuelTransactionFormValues;
  onSubmit: () => void;
  setForm: Dispatch<SetStateAction<FuelTransactionFormValues>>;
  stations: LookupOption[];
  submitting: boolean;
  trips: LookupOption[];
  vehicles: LookupOption[];
}) {
  const fuelTypes: FuelType[] = ["diesel", "petrol", "kerosene", "other"];
  const paymentMethods: FuelPaymentMethod[] = [
    "cash",
    "credit",
    "fuel_card",
    "voucher",
    "internal",
  ];

  return (
    <Card className="rounded-[2rem] p-6">
      <div className="mb-5">
        <h3>Fuel transaction</h3>
        <p className="mt-2 text-sm">Capture live refueling activity against vehicles, drivers, and trips.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Reference number">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, reference_no: event.target.value }))} value={form.reference_no} />
        </FormField>
        <FormField label="Transaction date">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, transaction_date: event.target.value }))} type="date" value={form.transaction_date} />
        </FormField>
        <FormField label="Vehicle">
          <LookupSelect onChange={(value) => setForm((current) => ({ ...current, vehicle_id: value }))} options={vehicles} placeholder="Select vehicle" value={form.vehicle_id} />
        </FormField>
        <FormField label="Driver">
          <LookupSelect onChange={(value) => setForm((current) => ({ ...current, driver_id: value }))} options={drivers} placeholder="Optional driver" value={form.driver_id} />
        </FormField>
        <FormField label="Trip">
          <LookupSelect onChange={(value) => setForm((current) => ({ ...current, trip_id: value }))} options={trips} placeholder="Optional trip" value={form.trip_id} />
        </FormField>
        <FormField label="Station">
          <LookupSelect onChange={(value) => setForm((current) => ({ ...current, station_id: value }))} options={stations} placeholder="Select station" value={form.station_id} />
        </FormField>
        <FormField label="Fuel type">
          <select className="form-select" onChange={(event) => setForm((current) => ({ ...current, fuel_type: event.target.value as FuelType }))} value={form.fuel_type}>
            {fuelTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Payment method">
          <select className="form-select" onChange={(event) => setForm((current) => ({ ...current, payment_method: event.target.value as FuelPaymentMethod }))} value={form.payment_method}>
            {paymentMethods.map((method) => (
              <option key={method} value={method}>
                {method.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Litres">
          <input className="form-input" min="0" onChange={(event) => setForm((current) => ({ ...current, litres: event.target.value }))} step="0.01" type="number" value={form.litres} />
        </FormField>
        <FormField label="Unit price">
          <input className="form-input" min="0" onChange={(event) => setForm((current) => ({ ...current, unit_price: event.target.value }))} step="0.01" type="number" value={form.unit_price} />
        </FormField>
        <FormField label="Odometer reading">
          <input className="form-input" min="0" onChange={(event) => setForm((current) => ({ ...current, odometer_reading: event.target.value }))} step="0.01" type="number" value={form.odometer_reading} />
        </FormField>
        <label className="inline-flex items-center gap-3 rounded-2xl border border-surface-border bg-white/70 px-4 py-3 text-sm font-medium text-app-secondary dark:bg-slate-900/70">
          <input checked={form.full_tank} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" onChange={(event) => setForm((current) => ({ ...current, full_tank: event.target.checked }))} type="checkbox" />
          Full tank
        </label>
      </div>
      <FormField label="Notes">
        <textarea className="form-textarea" onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} value={form.notes} />
      </FormField>
      <div className="mt-5 flex justify-end">
        <Button disabled={submitting} onClick={onSubmit} type="button">
          {submitting ? "Saving..." : "Record transaction"}
        </Button>
      </div>
    </Card>
  );
}

export function FuelConsumptionFormCard({
  form,
  onSubmit,
  setForm,
  submitting,
  vehicles,
}: {
  form: FuelConsumptionFormValues;
  onSubmit: () => void;
  setForm: Dispatch<SetStateAction<FuelConsumptionFormValues>>;
  submitting: boolean;
  vehicles: LookupOption[];
}) {
  return (
    <Card className="rounded-[2rem] p-6">
      <div className="mb-5">
        <h3>Consumption period</h3>
        <p className="mt-2 text-sm">Track efficiency over a defined odometer and fuel period.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Vehicle">
          <LookupSelect onChange={(value) => setForm((current) => ({ ...current, vehicle_id: value }))} options={vehicles} placeholder="Select vehicle" value={form.vehicle_id} />
        </FormField>
        <FormField label="Period start">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, period_start: event.target.value }))} type="date" value={form.period_start} />
        </FormField>
        <FormField label="Period end">
          <input className="form-input" onChange={(event) => setForm((current) => ({ ...current, period_end: event.target.value }))} type="date" value={form.period_end} />
        </FormField>
        <FormField label="Opening odometer">
          <input className="form-input" min="0" onChange={(event) => setForm((current) => ({ ...current, opening_odometer: event.target.value }))} step="0.01" type="number" value={form.opening_odometer} />
        </FormField>
        <FormField label="Closing odometer">
          <input className="form-input" min="0" onChange={(event) => setForm((current) => ({ ...current, closing_odometer: event.target.value }))} step="0.01" type="number" value={form.closing_odometer} />
        </FormField>
        <FormField label="Total litres">
          <input className="form-input" min="0" onChange={(event) => setForm((current) => ({ ...current, total_litres: event.target.value }))} step="0.01" type="number" value={form.total_litres} />
        </FormField>
        <FormField label="Total cost">
          <input className="form-input" min="0" onChange={(event) => setForm((current) => ({ ...current, total_cost: event.target.value }))} step="0.01" type="number" value={form.total_cost} />
        </FormField>
      </div>
      <FormField label="Notes">
        <textarea className="form-textarea" onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} value={form.notes} />
      </FormField>
      <div className="mt-5 flex justify-end">
        <Button disabled={submitting} onClick={onSubmit} type="button">
          {submitting ? "Saving..." : "Create consumption period"}
        </Button>
      </div>
    </Card>
  );
}
