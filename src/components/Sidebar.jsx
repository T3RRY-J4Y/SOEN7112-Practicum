import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ListOrdered,
  Receipt,
  ShieldCheck,
  FlaskConical,
  ScrollText,
  Plus,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, cap: 'dashboard.view', end: true },
  { to: '/patients', label: 'Patients', icon: Users, cap: 'patients.view' },
  { to: '/appointments', label: 'Appointments', icon: CalendarDays, cap: 'appointments.view' },
  { to: '/queue', label: 'Walk-in Queue', icon: ListOrdered, cap: 'queue.view' },
  { to: '/billing', label: 'Billing', icon: Receipt, cap: 'billing.view' },
  { to: '/claims', label: 'Insurance Claims', icon: ShieldCheck, cap: 'claims.view' },
  { to: '/lab', label: 'Lab & Pharmacy', icon: FlaskConical, cap: 'lab.view' },
  { to: '/audit', label: 'Audit Log', icon: ScrollText, cap: 'audit.view' },
]

export default function Sidebar({ onNavigate }) {
  const { can } = useAuth()
  const items = NAV.filter((n) => can(n.cap))

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-3 px-5 py-5">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white">
          <Plus className="h-6 w-6" strokeWidth={3} />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-slate-800">Riverside EHR</p>
          <p className="text-xs text-slate-400">Suburban Medical Clinic</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-100 px-5 py-4 text-xs text-slate-400">
        Prototype · v1.0
      </div>
    </aside>
  )
}
