def build_payroll_period_excel_rows(summary):
    rows = [
        [
            "Driver",
            "Delivered Trips",
            "Verified Trips",
            "Gross Trip Revenue",
            "Gross Bonus Earnings",
            "Gross Non Trip Earnings",
            "Gross Policy Earnings",
            "Total Deductions",
            "Net Payable",
        ]
    ]
    for payslip in summary["payslips"]:
        rows.append(
            [
                payslip.driver.full_name,
                payslip.delivered_trip_count,
                payslip.verified_trip_count,
                payslip.gross_trip_revenue,
                payslip.gross_bonus_earnings,
                payslip.gross_non_trip_earnings,
                payslip.gross_policy_earnings,
                payslip.total_deductions,
                payslip.net_trip_pay,
            ]
        )
    return rows
