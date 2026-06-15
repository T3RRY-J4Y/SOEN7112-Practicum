import { Link } from 'react-router-dom'
import {
  CalendarDays,
  ListOrdered,
  Receipt,
  FlaskConical,
  ArrowRight,
  Clock,
} from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { PageHeader, StatCard, StatusBadge, EmptyState } from '../components/ui.jsx'
import { fullName, money, fmtTime, sameDay, invoiceBalance } from '../lib/utils.js'

export default function Dashboard() {
  const { user } = useAuth()
  const data = useData()

  const todays = data.appointments
    .filter((a) => sameDay(a.start, new Date()) && a.status !== 'cancelled')
    .sort((a, b) => new Date(a.start) - new Date(b.start))

  const waiting = data.queue.filter((q) => q.status === 'waiting')
  const outstanding = data.invoices.filter((inv) => invoiceBalance(inv) > 0)
  const outstandingTotal = outstanding.reduce((s, inv) => s + invoiceBalance(inv), 0)
  const pendingLabs = data.labOrders.filter((o) => o.status === 'pending')

  const greeting =
    new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div>
      <PageHeader
        title={`${greeting}, ${user.name.split(' ')[0]}`}
        subtitle="Here's what's happening at the clinic today."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={CalendarDays} label="Today's appointments" value={todays.length} tone="brand" />
        <StatCard icon={ListOrdered} label="In the queue" value={waiting.length} tone="amber" />
        <StatCard
          icon={Receipt}
          label="Outstanding invoices"
          value={outstanding.length}
          hint={money(outstandingTotal)}
          tone="rose"
        />
        <StatCard icon={FlaskConical} label="Pending lab results" value={pendingLabs.length} tone="violet" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Today's schedule */}
        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Today's schedule</h2>
            <Link to="/appointments" className="text-sm font-medium text-brand-600 hover:underline">
              View all
            </Link>
          </div>
          {todays.length === 0 ? (
            <EmptyState icon={CalendarDays} title="No appointments today" message="Enjoy the quiet day." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {todays.map((a) => (
                <li key={a.id} className="flex items-center gap-3 py-3">
                  <span className="flex items-center gap-1 text-sm font-medium text-slate-500">
                    <Clock className="h-4 w-4" />
                    {fmtTime(a.start)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-800">
                      {fullName(data.getPatient(a.patientId))}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {a.reason} · {data.getUser(a.doctorId)?.name}
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Walk-in queue */}
        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Walk-in queue</h2>
            <Link to="/queue" className="text-sm font-medium text-brand-600 hover:underline">
              Manage
            </Link>
          </div>
          {waiting.length === 0 ? (
            <EmptyState icon={ListOrdered} title="Queue is empty" message="No walk-ins waiting." />
          ) : (
            <ul className="space-y-2">
              {waiting
                .sort((a, b) => a.number - b.number)
                .map((q) => (
                  <li key={q.id} className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-600 font-semibold text-white">
                      {q.number}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-800">
                        {fullName(data.getPatient(q.patientId))}
                      </p>
                      <p className="truncate text-xs text-slate-400">{q.reason}</p>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </section>

        {/* Outstanding invoices */}
        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Outstanding invoices</h2>
            <Link to="/billing" className="text-sm font-medium text-brand-600 hover:underline">
              Go to billing
            </Link>
          </div>
          {outstanding.length === 0 ? (
            <EmptyState icon={Receipt} title="All settled" message="No outstanding balances." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {outstanding.map((inv) => (
                <li key={inv.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-slate-800">{inv.number}</p>
                    <p className="text-xs text-slate-400">{fullName(data.getPatient(inv.patientId))}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-rose-600">{money(invoiceBalance(inv))}</p>
                    <StatusBadge status={inv.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Pending labs */}
        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Pending lab results</h2>
            <Link to="/lab" className="text-sm font-medium text-brand-600 hover:underline">
              Lab &amp; pharmacy
            </Link>
          </div>
          {pendingLabs.length === 0 ? (
            <EmptyState icon={FlaskConical} title="No pending results" message="All lab orders resulted." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {pendingLabs.map((o) => (
                <li key={o.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-slate-800">{o.test}</p>
                    <p className="text-xs text-slate-400">{fullName(data.getPatient(o.patientId))}</p>
                  </div>
                  <StatusBadge status={o.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-6">
        <Link to="/patients" className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline">
          Browse all patients <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
