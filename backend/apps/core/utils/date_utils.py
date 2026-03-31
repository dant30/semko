from __future__ import annotations

from datetime import date, datetime, time, timedelta
from typing import Optional, Union

from django.utils import timezone

DateLike = Union[str, date, datetime]
DatetimeLike = Union[str, datetime]


def now() -> datetime:
    """Return the current timezone-aware datetime."""
    return timezone.now()


def today() -> date:
    """Return the current date in the active timezone."""
    return timezone.localdate()


def utcnow() -> datetime:
    """Return the current UTC datetime."""
    return timezone.now().astimezone(timezone.utc)


def _ensure_aware(value: datetime) -> datetime:
    if timezone.is_naive(value):
        return timezone.make_aware(value, timezone.get_current_timezone())
    return value


def parse_date(value: DateLike, fmt: str = "%Y-%m-%d") -> date:
    """Parse a string or datetime-like value into a date."""
    if isinstance(value, date) and not isinstance(value, datetime):
        return value
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, str):
        return datetime.strptime(value.strip(), fmt).date()
    raise TypeError("Unsupported date type: %r" % type(value))


def parse_datetime(value: DatetimeLike, fmt: str = "%Y-%m-%dT%H:%M:%S%z") -> datetime:
    """Parse a string or datetime into a timezone-aware datetime."""
    if isinstance(value, datetime):
        return _ensure_aware(value)
    if isinstance(value, str):
        normalized = value.strip()
        try:
            parsed = datetime.fromisoformat(normalized)
        except ValueError:
            parsed = datetime.strptime(normalized, fmt)
        return _ensure_aware(parsed)
    raise TypeError("Unsupported datetime type: %r" % type(value))


def start_of_day(value: DateLike) -> datetime:
    """Return the start of the day for a date or datetime."""
    if isinstance(value, datetime):
        value = value.date()
    parsed_date = parse_date(value)
    return timezone.make_aware(datetime.combine(parsed_date, time.min))


def end_of_day(value: DateLike) -> datetime:
    """Return the end of the day for a date or datetime."""
    if isinstance(value, datetime):
        value = value.date()
    parsed_date = parse_date(value)
    return timezone.make_aware(datetime.combine(parsed_date, time.max))


def start_of_week(value: DateLike) -> datetime:
    """Return the Monday at the start of the week for a date or datetime."""
    parsed_date = parse_date(value)
    monday = parsed_date - timedelta(days=(parsed_date.weekday()))
    return timezone.make_aware(datetime.combine(monday, time.min))


def end_of_week(value: DateLike) -> datetime:
    """Return the Sunday at the end of the week for a date or datetime."""
    parsed_date = parse_date(value)
    sunday = parsed_date + timedelta(days=(6 - parsed_date.weekday()))
    return timezone.make_aware(datetime.combine(sunday, time.max))


def start_of_month(value: DateLike) -> datetime:
    """Return the first instant of the month for a date or datetime."""
    parsed_date = parse_date(value)
    first_day = parsed_date.replace(day=1)
    return timezone.make_aware(datetime.combine(first_day, time.min))


def end_of_month(value: DateLike) -> datetime:
    """Return the last instant of the month for a date or datetime."""
    parsed_date = parse_date(value)
    next_month = parsed_date.replace(day=28) + timedelta(days=4)
    last_day = next_month - timedelta(days=next_month.day)
    return timezone.make_aware(datetime.combine(last_day, time.max))


def days_between(start: DateLike, end: DateLike) -> int:
    """Return the inclusive number of days between two dates."""
    return abs((parse_date(end) - parse_date(start)).days)


def is_today(value: DateLike) -> bool:
    """Return True when a date or datetime is today in the active timezone."""
    return parse_date(value) == today()
