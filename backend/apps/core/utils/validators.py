from __future__ import annotations

import re
import uuid
from datetime import datetime
from typing import Iterable

from django.core.exceptions import ValidationError
from django.core.validators import EmailValidator
from django.utils.translation import gettext_lazy as _


def validate_non_empty_string(value: str, field_name: str = "value") -> None:
    """Ensure a string is not empty or whitespace-only."""
    if not isinstance(value, str) or not value.strip():
        raise ValidationError(_("%(field)s must be a non-empty string."), params={"field": field_name})


def validate_positive_int(value: int, field_name: str = "value") -> None:
    """Ensure a numeric value is a positive integer."""
    if not isinstance(value, int) or value < 0:
        raise ValidationError(_("%(field)s must be a positive integer."), params={"field": field_name})


def validate_uuid(value: str, field_name: str = "id") -> None:
    """Validate that a string is a valid UUID."""
    try:
        uuid.UUID(str(value))
    except (ValueError, TypeError):
        raise ValidationError(_("%(field)s must be a valid UUID."), params={"field": field_name})


def validate_email(value: str, field_name: str = "email") -> None:
    """Validate that a string is a correctly formatted email address."""
    EmailValidator()(
        value,
    )


def validate_date_string(value: str, date_format: str = "%Y-%m-%d", field_name: str = "date") -> None:
    """Validate that a string can be parsed as a date."""
    try:
        datetime.strptime(value, date_format)
    except (TypeError, ValueError):
        raise ValidationError(
            _("%(field)s must be a valid date in the format %(format)s."),
            params={"field": field_name, "format": date_format},
        )


def validate_choice(value: str, choices: Iterable[str], field_name: str = "choice") -> None:
    """Validate that a value exists in a known choice list."""
    if value not in set(choices):
        raise ValidationError(
            _("%(field)s must be one of %(choices)s."),
            params={"field": field_name, "choices": ", ".join(str(item) for item in choices)},
        )
