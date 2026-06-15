import { useState } from 'react'
import { ListOrdered, Plus, PhoneCall, Check, Clock } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { PageHeader, Modal, Field, StatusBadge, EmptyState } from '../components/ui.jsx'
import { fullName, fmtTime } from '../lib/utils.js'

export default function Queue() {
  const data = useData()
  const { can } = useAuth()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [patientId, setPatientId] = useState(data.patients[0]?.id)
  const [reason, setReason] = useState('')

  const waiting = data.queue
    .filter((q) => q.status === 'waiting')
    .sort((a, b) => a.number - b.number)
  const inConsult = data.queue.filter((q) => q.status === 'in-consult')
  const nowServing = inConsult[inConsult.length - 1]

  const add = (e) => {
    e.preventDefault()
    const item = data.addToQueue(patientId, reason || 'Walk-in')
    toast(`Added to queue as #${item.number}`, { title: 'Walk-in registered' })
    setReason('')
    setOpen(false)
  }

  const callNext = () => {
    const next = data.callNext()
    if (!next) return toast('No one waiting in the queue', { type: 'info' })
    toast(`Now calling #${next.number} · ${fullName(data.getPatient(next.patientId))}`, {
      title: 'Call next',
    })
  }

  const complete = (q) => {
    data.completeQueueItem(q.id)
    toast(`#${q.number} completed`)
  }

  return (
    <div>
      <PageHeader
        title="Walk-in Queue"
        subtitle="Live queue for patients without an appointment."
        icon={ListOrdered}
        actions={
          can('queue.manage') && (
            <div className="flex gap-2">
              <button className="btn-secondary" onClick={callNext}>
                <PhoneCall className="h-4 w-4" /> Call next
              </button>
              <button className="btn-primary" onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4" /> Add walk-in
              </button>
            </div>
          )
        }
      />

      {/* Now serving banner */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card flex flex-col items-center justify-center bg-brand-600 p-6 text-white sm:col-span-1">
          <p className="text-sm uppercase tracking-wide text-brand-100">Now serving</p>
          <p className="text-5xl font-bold">{nowServing ? `#${nowServing.number}` : '—'}</p>
          <p className="text-sm text-brand-100">
            {nowServing ? fullName(data.getPatient(nowServing.patientId)) : 'Nobody in consult'}
          </p>
        </div>
        <div className="card flex items-center justify-center p-6 sm:col-span-1">
          <div className="text-center">
            <p className="text-sm text-slate-400">Waiting</p>
            <p className="text-5xl font-bold text-amber-600">{waiting.length}</p>
          </div>
        </div>
        <div className="card flex items-center justify-center p-6 sm:col-span-1">
          <div className="text-center">
            <p className="text-sm text-slate-400">Next up</p>
            <p className="text-5xl font-bold text-slate-700">{waiting[0] ? `#${waiting[0].number}` : '—'}</p>
          </div>
        </div>
      </div>

      <h2 className="mb-3 font-semibold text-slate-800">Waiting list</h2>
      {waiting.length === 0 ? (
        <EmptyState icon={ListOrdered} title="Queue is empty" message="Add a walk-in to get started." />
      ) : (
        <ul className="space-y-2">
          {waiting.map((q, i) => (
            <li key={q.id} className="card flex items-center gap-4 p-4">
              <span
                className={`grid h-12 w-12 place-items-center rounded-xl text-lg font-bold ${
                  i === 0 ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {q.number}
              </span>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">{fullName(data.getPatient(q.patientId))}</p>
                <p className="text-sm text-slate-500">{q.reason}</p>
              </div>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="h-3.5 w-3.5" /> {fmtTime(q.addedAt)}
              </span>
              <StatusBadge status={q.status} />
            </li>
          ))}
        </ul>
      )}

      {inConsult.length > 0 && (
        <>
          <h2 className="mb-3 mt-6 font-semibold text-slate-800">In consultation</h2>
          <ul className="space-y-2">
            {inConsult.map((q) => (
              <li key={q.id} className="card flex items-center gap-4 p-4">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-100 text-lg font-bold text-brand-700">
                  {q.number}
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{fullName(data.getPatient(q.patientId))}</p>
                  <p className="text-sm text-slate-500">{q.reason}</p>
                </div>
                {can('queue.manage') && (
                  <button className="btn-ghost text-emerald-600" onClick={() => complete(q)}>
                    <Check className="h-4 w-4" /> Done
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add walk-in to queue">
        <form onSubmit={add} className="space-y-4">
          <Field label="Patient">
            <select className="input" value={patientId} onChange={(e) => setPatientId(e.target.value)}>
              {data.patients.map((p) => (
                <option key={p.id} value={p.id}>{fullName(p)}</option>
              ))}
            </select>
          </Field>
          <Field label="Reason">
            <input className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Sore throat" />
          </Field>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary"><Plus className="h-4 w-4" /> Add to queue</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
