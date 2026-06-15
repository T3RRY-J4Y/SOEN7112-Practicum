import { useEffect } from 'react'
import { X } from 'lucide-react'

export function PageHeader({ title, subtitle, actions, icon: Icon }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        {Icon && (
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-100 text-brand-700">
            <Icon className="h-6 w-6" />
          </span>
        )}
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function StatCard({ icon: Icon, label, value, tone = 'brand', hint }) {
  const tones = {
    brand: 'bg-brand-100 text-brand-700',
    amber: 'bg-amber-100 text-amber-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    rose: 'bg-rose-100 text-rose-700',
    violet: 'bg-violet-100 text-violet-700',
  }
  return (
    <div className="card flex items-center gap-4 p-5">
      <span className={`grid h-12 w-12 place-items-center rounded-xl ${tones[tone]}`}>
        <Icon className="h-6 w-6" />
      </span>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-semibold text-slate-800">{value}</p>
        {hint && <p className="text-xs text-slate-400">{hint}</p>}
      </div>
    </div>
  )
}

const BADGE_TONES = {
  scheduled: 'bg-brand-100 text-brand-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-slate-200 text-slate-600',
  waiting: 'bg-amber-100 text-amber-700',
  'in-consult': 'bg-brand-100 text-brand-700',
  done: 'bg-emerald-100 text-emerald-700',
  paid: 'bg-emerald-100 text-emerald-700',
  partial: 'bg-amber-100 text-amber-700',
  unpaid: 'bg-rose-100 text-rose-700',
  submitted: 'bg-brand-100 text-brand-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700',
  pending: 'bg-amber-100 text-amber-700',
  resulted: 'bg-emerald-100 text-emerald-700',
  sent: 'bg-emerald-100 text-emerald-700',
  default: 'bg-slate-100 text-slate-600',
}

export function StatusBadge({ status }) {
  const tone = BADGE_TONES[status] || BADGE_TONES.default
  return <span className={`badge ${tone} capitalize`}>{status}</span>
}

export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 sm:items-center">
      <div className={`card w-full ${maxWidth} my-8`}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  )
}

export function Field({ label, children, className = '' }) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 text-center">
      {Icon && <Icon className="mb-3 h-10 w-10 text-slate-300" />}
      <p className="font-medium text-slate-600">{title}</p>
      {message && <p className="mt-1 max-w-sm text-sm text-slate-400">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
