import { useAppSelector } from "@/core/store/hooks";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

const operationalModules = [
  { title: "Trips", description: "Manage dispatch, delivery notes, and trip workflow." },
  { title: "Stores", description: "Track stock balances, requisitions, and issues." },
  { title: "Fuel", description: "Capture fueling activity and monitor efficiency." },
  { title: "Maintenance", description: "Follow schedules, service work, and parts used." },
  { title: "Payroll", description: "Review periods, approvals, and finalized payslips." },
  { title: "Notifications", description: "Track alerts, approvals, and system events." },
];

const quickActions = [
  "Create trip",
  "Receive store stock",
  "Record fuel transaction",
  "Schedule maintenance",
  "Open payroll period",
];

const recentSignals = [
  "3 maintenance schedules are overdue and need workshop attention.",
  "6 store requisitions are waiting for approval or issue action.",
  "Payroll period lock is pending finance review.",
];

export function DashboardPage() {
  const metrics = useAppSelector((state) => state.dashboard.metrics);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 sm:px-6 lg:px-8">
      <section className="space-y-4">
        <div className="text-sm font-semibold uppercase tracking-wider text-app-muted">Operational dashboard</div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card className="hover-lift rounded-3xl border-white/70 p-5" key={metric.label}>
            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-app-muted">
              {metric.label}
            </span>
            <strong className="mt-4 block text-3xl text-app-primary">{metric.value}</strong>
            <div className="mt-4 h-1.5 w-16 rounded-full bg-gradient-primary" />
          </Card>
        ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {operationalModules.map((module) => (
          <Card className="hover-lift rounded-3xl p-6" key={module.title}>
            <h3>{module.title}</h3>
            <p className="mt-3">{module.description}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-3xl p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3>Quick actions</h3>
              <p className="mt-2 text-sm">Jump straight into the work that keeps operations moving.</p>
            </div>
            <Badge>Today</Badge>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            {quickActions.map((action) => (
              <Button key={action} type="button" variant="secondary">
                {action}
              </Button>
            ))}
          </div>
        </Card>

        <Card className="rounded-3xl p-6">
          <div>
            <h3>Operational signals</h3>
            <p className="mt-2 text-sm">The next issues most likely to affect delivery and compliance.</p>
          </div>
          <ul className="mt-5 space-y-4">
            {recentSignals.map((signal) => (
              <li className="flex gap-3 text-sm text-app-secondary" key={signal}>
                <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-gradient-primary" />
                <span>{signal}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}
