import { useMemo, useState } from 'react'
import { ScrollText, Search, RotateCcw } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { PageHeader, EmptyState } from '../components/ui.jsx'
import { fmtDateTime } from '../lib/utils.js'
import { ROLES } from '../lib/rbac.js'

const ACTION_TONE = {
  create: 'bg-emerald-100 text-emerald-700',
  update: 'bg-brand-100 text-brand-700',
  delete: 'bg-rose-100 text-rose-700',
  payment: 'bg-violet-100 text-violet-700',
  notify: 'bg-amber-100 text-amber-700',
  seed: 'bg-slate-100 text-slate-600',
}

export default function AuditLog() {
  const data = useData()
  const { toast } = useToast()
  const [query, setQuery] = useState('')
  const [action, setAction] = useState('all')

  const actions = useMemo(
    () => ['all', ...new Set(data.auditLog.map((l) => l.action))],
    [data.auditLog],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return data.auditLog.filter((l) => {
      if (action !== 'all' && l.action !== action) return false
      if (!q) return true
      return (
        l.actor.toLowerCase().includes(q) ||
        l.entity.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q) ||
        l.entityId.toLowerCase().includes(q)
      )
    })
  }, [data.auditLog, query, action])

  const reset = () => {
    if (window.confirm('Reset all demo data back to the original seed? This cannot be undone.')) {
      data.resetDemo()
      toast('Demo data reset to seed', { type: 'info' })
    }
  }

  return (
    <div>
      <PageHeader
        title="Audit Log"
        subtitle="Every create, edit, delete and notification is recorded here."
        icon={ScrollText}
        actions={
          <button className="btn-secondary" onClick={reset} title="Reset demo data">
            <RotateCcw className="h-4 w-4" /> Reset demo data
          </button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-10"
            placeholder="Search by user, entity or detail…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select className="input sm:w-48" value={action} onChange={(e) => setAction(e.target.value)}>
          {actions.map((a) => (
            <option key={a} value={a} className="capitalize">{a === 'all' ? 'All actions' : a}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ScrollText} title="No matching entries" message="Try a different filter." />
      ) : (
        <div className="card overflow-hidden">
          <div className="hidden grid-cols-12 gap-2 border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 md:grid">
            <div className="col-span-3">When</div>
            <div className="col-span-3">Who</div>
            <div className="col-span-2">Action</div>
            <div className="col-span-4">Details</div>
          </div>
          <ul className="divide-y divide-slate-100">
            {filtered.map((l) => {
              const role = ROLES[l.role] || ROLES.system
              return (
                <li key={l.id} className="grid grid-cols-1 gap-1 px-5 py-3 text-sm md:grid-cols-12 md:items-center md:gap-2">
                  <div className="col-span-3 text-slate-500">{fmtDateTime(l.at)}</div>
                  <div className="col-span-3">
                    <span className="font-medium text-slate-700">{l.actor}</span>
                    <span className={`badge ml-2 ${role.color}`}>{role.label}</span>
                  </div>
                  <div className="col-span-2">
                    <span className={`badge capitalize ${ACTION_TONE[l.action] || 'bg-slate-100 text-slate-600'}`}>
                      {l.action}
                    </span>
                    <span className="ml-1 text-xs text-slate-400">{l.entity}</span>
                  </div>
                  <div className="col-span-4 text-slate-600">{l.details}</div>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <p className="mt-3 text-xs text-slate-400">{filtered.length} of {data.auditLog.length} entries</p>
    </div>
  )
}
