import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";

import { Button } from "./Button";
import { Input } from "./Input";
import { classNames } from "@/shared/utils/classnames";

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function parseDateValue(value?: string | Date | null): Date | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  const normalized = String(value).trim();
  if (!normalized) {
    return null;
  }

  const parsed = new Date(`${normalized}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function formatFriendlyDate(date: Date | null): string {
  if (!date) {
    return "";
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isSameDate(a: Date | null, b: Date | null): boolean {
  return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function buildMonthGrid(baseDate: Date): Array<Date | null> {
  const startOfMonth = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const daysInMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = startOfMonth.getDay();

  const grid: Array<Date | null> = [];
  for (let index = 0; index < firstDayOfWeek; index += 1) {
    grid.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    grid.push(new Date(baseDate.getFullYear(), baseDate.getMonth(), day));
  }

  while (grid.length % 7 !== 0) {
    grid.push(null);
  }

  return grid;
}

export interface DatePickerProps {
  id?: string;
  label?: string;
  description?: string;
  placeholder?: string;
  value?: string | Date | null;
  onChange: (value: string | null) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
  className?: string;
}

export function DatePicker({
  id,
  label,
  description,
  placeholder = "Select a date",
  value,
  onChange,
  min,
  max,
  disabled = false,
  className,
}: DatePickerProps) {
  const selectedDate = parseDateValue(value);
  const minDate = parseDateValue(min);
  const maxDate = parseDateValue(max);
  const [isOpen, setIsOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<Date>(() => selectedDate ?? new Date());
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedDate) {
      setViewMonth(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    function handleWindowClick(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    window.addEventListener("mousedown", handleWindowClick);
    return () => window.removeEventListener("mousedown", handleWindowClick);
  }, []);

  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(viewMonth),
    [viewMonth]
  );

  const days = useMemo(() => buildMonthGrid(viewMonth), [viewMonth]);

  const showClear = !!selectedDate;

  function updateMonth(offset: number) {
    setViewMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  function handleSelect(date: Date) {
    if (minDate && date < minDate) return;
    if (maxDate && date > maxDate) return;
    onChange(toISODate(date));
    setIsOpen(false);
  }

  function handleClear() {
    onChange(null);
    setIsOpen(false);
  }

  function handleToday() {
    const today = new Date();
    setViewMonth(today);
    handleSelect(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
  }

  return (
    <div className={classNames("relative", className)} ref={wrapperRef}>
      {label && (
        <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
          {label}
        </label>
      )}

      <div className="flex items-center gap-2">
        <Input
          id={id}
          readOnly
          disabled={disabled}
          value={formatFriendlyDate(selectedDate)}
          placeholder={placeholder}
          onClick={() => !disabled && setIsOpen(true)}
          leftIcon={<CalendarDays size={18} />}
          className="cursor-pointer"
        />
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          disabled={disabled}
          className="whitespace-nowrap"
        >
          {isOpen ? "Close" : "Calendar"}
        </Button>
      </div>

      {description && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{description}</p>}

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-[22rem] overflow-hidden rounded-3xl border border-surface-border bg-white text-slate-900 shadow-soft dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
          <div className="flex items-center justify-between gap-2 border-b border-surface-border px-4 py-3 dark:border-slate-800">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => updateMonth(-1)}
                className="p-2"
              >
                <ChevronLeft size={16} />
              </Button>
              <span>{monthLabel}</span>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => updateMonth(1)}
                className="p-2"
              >
                <ChevronRight size={16} />
              </Button>
            </div>
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsOpen(false)} className="p-2">
              <X size={16} />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            {WEEKDAY_LABELS.map((labelItem) => (
              <div key={labelItem}>{labelItem}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 px-4 pb-4">
            {days.map((day, index) => {
              const isDisabled =
                !day ||
                (!!minDate && day < minDate) ||
                (!!maxDate && day > maxDate);
              const isSelected = isSameDate(day, selectedDate);
              const isToday = day ? isSameDate(day, parseDateValue(new Date())) : false;

              return (
                <button
                  key={`${day?.toDateString() ?? "empty"}-${index}`}
                  type="button"
                  disabled={isDisabled}
                  className={classNames(
                    "aspect-square w-full rounded-2xl text-sm font-medium transition-all",
                    day ? "hover:bg-accent-100 hover:text-accent-900 dark:hover:bg-slate-800" : "cursor-default",
                    isSelected && "bg-accent-600 text-white dark:bg-accent-500",
                    !day && "bg-transparent text-transparent",
                    isDisabled && "cursor-not-allowed opacity-50",
                    isToday && !isSelected && "ring-1 ring-slate-300 dark:ring-slate-700"
                  )}
                  onClick={() => day && handleSelect(day)}
                >
                  {day?.getDate() ?? ""}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-surface-border px-4 py-3 dark:border-slate-800">
            <Button variant="ghost" size="sm" type="button" onClick={handleToday}>
              Today
            </Button>
            {showClear ? (
              <Button variant="outline" size="sm" type="button" onClick={handleClear}>
                Clear
              </Button>
            ) : (
              <div />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

DatePicker.displayName = "DatePicker";
