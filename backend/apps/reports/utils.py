from datetime import datetime


def build_report_filename(report_id: int, extension: str = "csv") -> str:
    """Return a standardized report filename for generated output."""
    timestamp = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    return f"report-{report_id}-{timestamp}.{extension}"  
