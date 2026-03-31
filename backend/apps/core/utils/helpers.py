from __future__ import annotations

from collections.abc import Iterable
from decimal import Decimal
from typing import Any, Iterator, Type, TypeVar

from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpRequest
from django.urls import reverse
from django.utils.module_loading import import_string

T = TypeVar("T")
ModelType = TypeVar("ModelType")


def get_object_or_none(model: Type[ModelType], *args: Any, **kwargs: Any) -> ModelType | None:
    """Return a query object or None if it does not exist."""
    try:
        return model.objects.get(*args, **kwargs)
    except ObjectDoesNotExist:
        return None


def compact_dict(data: dict[Any, Any]) -> dict[Any, Any]:
    """Remove any keys with empty values from a dictionary."""
    return {key: value for key, value in data.items() if value not in (None, "", [], {}, ())}


def chunked(iterable: Iterable[T], size: int) -> Iterator[list[T]]:
    """Yield fixed-size chunks from an iterable."""
    if size < 1:
        raise ValueError("Chunk size must be a positive integer.")

    chunk: list[T] = []
    for item in iterable:
        chunk.append(item)
        if len(chunk) == size:
            yield chunk
            chunk = []

    if chunk:
        yield chunk


def safe_cast(value: Any, to_type: Type[T], default: T | None = None) -> T | None:
    """Cast a value to a given type, returning a default on failure."""
    try:
        return to_type(value)
    except (TypeError, ValueError):
        return default


def ensure_list(value: Any) -> list[Any]:
    """Return a list from any iterable or scalar value."""
    if value is None:
        return []
    if isinstance(value, list):
        return value
    if isinstance(value, Iterable) and not isinstance(value, (str, bytes, dict)):
        return list(value)
    return [value]


def coerce_bool(value: Any) -> bool:
    """Convert a variety of truthy/falsey values to boolean."""
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.strip().lower() in ("1", "true", "yes", "on")
    return bool(value)


def build_absolute_url(path: str, request: HttpRequest | None = None) -> str:
    """Build an absolute URL from a relative path and optional HttpRequest."""
    if request is not None:
        return request.build_absolute_uri(path)
    return path


def import_from_string(path: str) -> Any:
    """Load a Python object given its dotted import path."""
    return import_string(path)


def format_decimal_value(value: Any, precision: int = 2) -> str:
    """Format a numeric value consistently for display."""
    try:
        number = Decimal(str(value))
    except (TypeError, ValueError, ArithmeticError):
        return "0.00"
    quantize = Decimal("1." + "0" * precision)
    return f"{number.quantize(quantize):,.{precision}f}"
