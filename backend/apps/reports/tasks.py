from celery import shared_task

from apps.reports.services import build_payroll_period_csv, get_payroll_period_report_data
from apps.reports.utils import build_report_filename


@shared_task(bind=True)
def export_payroll_period_summary_csv(self, payroll_period_id: int) -> str:
    """Build a CSV summary for a payroll period and return it as text."""
    summary = get_payroll_period_report_data(payroll_period_id)
    filename = build_report_filename(payroll_period_id, extension="csv")
    self.update_state(state="SUCCESS", meta={"filename": filename})
    return build_payroll_period_csv(summary)
