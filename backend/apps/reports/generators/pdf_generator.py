def build_payroll_period_pdf_payload(summary):
    lines = [
        f"Payroll Period: {summary['payroll_period']}",
        f"Status: {summary['status']}",
        f"Drivers: {summary['driver_count']}",
        f"Gross Policy Earnings: {summary['gross_policy_earnings']}",
        f"Total Deductions: {summary['total_deductions']}",
        f"Net Payable: {summary['net_trip_pay']}",
    ]
    return "\n".join(lines).encode("utf-8")


def build_payslip_pdf_payload(payslip):
    lines = [
        "SEMKO PAYSLIP",
        f"Payroll Period: {payslip.payroll_period.name}",
        f"Driver: {payslip.driver.full_name}",
        f"Delivered Trips: {payslip.delivered_trip_count}",
        f"Verified Trips: {payslip.verified_trip_count}",
        f"Gross Bonus Earnings: {payslip.gross_bonus_earnings}",
        f"Gross Non Trip Earnings: {payslip.gross_non_trip_earnings}",
        f"Gross Policy Earnings: {payslip.gross_policy_earnings}",
        f"Total Deductions: {payslip.total_deductions}",
        f"Net Payable: {payslip.net_trip_pay}",
    ]
    return "\n".join(lines).encode("utf-8")
