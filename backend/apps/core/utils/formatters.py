# backend/apps/core/utils/formatters.py
from __future__ import annotations

from datetime import date, datetime, timedelta
from decimal import Decimal, InvalidOperation
from typing import Any, Optional, Union

Number = Union[int, float, Decimal]


def format_decimal(value: Any, precision: int = 2, default: str = "0.00") -> str:
    """Format a numeric value with a fixed number of decimal places."""
    try:
        number = Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError):
        return default

    quantize = Decimal(f"1.{'0' * precision}")
    formatted = number.quantize(quantize)
    return f"{formatted:,.{precision}f}"


def format_currency(
    value: Any,
    currency_symbol: str = "$",
    precision: int = 2,
    include_symbol: bool = True,
    currency_code: Optional[str] = None,
) -> str:
    """Format a numeric value as currency."""
    amount = format_decimal(value, precision=precision)
    if include_symbol:
        return f"{currency_symbol}{amount}"
    if currency_code:
        return f"{amount} {currency_code}".strip()
    return amount


def format_percentage(value: Any, precision: int = 2, default: str = "0.00%") -> str:
    """Format a numeric value as a percentage string."""
    try:
        number = Decimal(str(value)) * Decimal("100")
    except (InvalidOperation, TypeError, ValueError):
        return default
    formatted = number.quantize(Decimal(f"1.{'0' * precision}"))
    return f"{formatted:,.{precision}f}%"


def format_duration(value: Union[int, float, timedelta], default: str = "0s") -> str:
    """Format seconds or timedelta as a human-friendly duration."""
    total_seconds = int(value.total_seconds() if isinstance(value, timedelta) else value)
    if total_seconds < 0:
        return default

    hours, remainder = divmod(total_seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    parts = []
    if hours:
        parts.append(f"{hours}h")
    if minutes:
        parts.append(f"{minutes}m")
    if seconds or not parts:
        parts.append(f"{seconds}s")
    return " ".join(parts)


def format_date(value: Union[str, date, datetime], fmt: str = "%Y-%m-%d") -> str:
    """Format a date or datetime to a string."""
    if isinstance(value, str):
        return value
    if isinstance(value, datetime):
        return value.date().strftime(fmt)
    return value.strftime(fmt)


def format_datetime(value: Union[str, datetime], fmt: str = "%Y-%m-%d %H:%M:%S") -> str:
    """Format a datetime or datetime string to a normalized string."""
    if isinstance(value, str):
        return value
    return value.strftime(fmt)

