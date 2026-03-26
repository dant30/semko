from datetime import timedelta

from django.utils import timezone

from apps.maintenance.models import MaintenanceSchedule


def build_schedule_due_state(schedule):
    today = timezone.now().date()
    is_date_overdue = bool(schedule.next_due_date and schedule.next_due_date < today)
    is_date_due = bool(schedule.next_due_date and schedule.next_due_date == today)
    is_odometer_overdue = bool(
        schedule.next_due_odometer is not None
        and schedule.current_odometer is not None
        and schedule.current_odometer > schedule.next_due_odometer
    )
    is_odometer_due = bool(
        schedule.next_due_odometer is not None
        and schedule.current_odometer is not None
        and schedule.current_odometer == schedule.next_due_odometer
    )

    if schedule.status in {
        MaintenanceSchedule.ScheduleStatus.COMPLETED,
        MaintenanceSchedule.ScheduleStatus.CANCELLED,
    }:
        return schedule.status
    if is_date_overdue or is_odometer_overdue:
        return MaintenanceSchedule.ScheduleStatus.OVERDUE
    if is_date_due or is_odometer_due:
        return MaintenanceSchedule.ScheduleStatus.DUE
    return MaintenanceSchedule.ScheduleStatus.SCHEDULED


def calculate_next_due_fields(last_service_date, last_service_odometer, interval_days, interval_km):
    next_due_date = None
    next_due_odometer = None
    if last_service_date and interval_days:
        next_due_date = last_service_date + timedelta(days=interval_days)
    if last_service_odometer is not None and interval_km:
        next_due_odometer = last_service_odometer + interval_km
    return {
        "next_due_date": next_due_date,
        "next_due_odometer": next_due_odometer,
    }
