import { useState } from 'react'
import { FlaskConical, Pill, Plus, ClipboardCheck, Building2 } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { PageHeader, Modal, Field, StatusBadge, EmptyState } from '../components/ui.jsx'
import { fullName, fmtDate } from '../lib/utils.js'

export default function LabPharmacy() {
  const data = useData()
  const { user, can } = useAuth()
  const { toast } = useToast()
  const [tab, setTab] = useState('lab')
  const [labOpen, setLabOpen] = useState(false)
  const [rxOpen, setRxOpen] = useState(false)
  const [resultFor, setResultFor] = useState(null)

  return (
    <div>
      <PageHeader
        title="Lab & Pharmacy"
        subtitle="Lab test orders, results and electronic prescriptions to partner pharmacies."
        icon={FlaskConical}
      />

      <div className="mb-4 flex gap-1 border-b border-slate-200">
        <button
          onClick={() => setTab('lab')}
          className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
            tab === 'lab' ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Lab orders
        </button>
        <button
          onClick={() => setTab('pharmacy')}
          className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
            tab === 'pharmacy' ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Prescriptions
        </button>
      </div>

      {tab === 'lab' && (
        <div>
          <div className="mb-4 flex justify-between">
            <div className="flex flex-wrap gap-2 text-sm text-slate-500">
              <span className="badge bg-amber-100 text-amber-700">
                {data.labOrders.filter((o) => o.status === 'pending').length} pending
              </span>
              <span className="badge bg-emerald-100 text-emerald-700">
                {data.labOrders.filter((o) => o.status === 'resulted').length} resulted
              </span>
            </div>
            {can('lab.order') && (
              <button className="btn-primary" onClick={() => setLabOpen(true)}>
                <Plus className="h-4 w-4" /> New lab order
              </button>
            )}
          </div>

          {data.labOrders.length === 0 ? (
            <EmptyState icon={FlaskConical} title="No lab orders" message="Raise a lab order to get started." />
          ) : (
            <div className="space-y-3">
              {data.labOrders.map((o) => (
                <div key={o.id} className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-800">{o.test}</p>
                      <StatusBadge status={o.status} />
                    </div>
                    <p className="text-sm text-slate-500">{fullName(data.getPatient(o.patientId))}</p>
                    <p className="text-xs text-slate-400">
                      Ordered {fmtDate(o.orderedAt)} by {data.getUser(o.doctorId)?.name || '—'}
                    </p>
                    {o.result && (
                      <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                        Result ({fmtDate(o.resultedAt)}): {o.result}
                      </p>
                    )}
                  </div>
                  {o.status === 'pending' && can('lab.result') && (
                    <button className="btn-secondary" onClick={() => setResultFor(o)}>
                      <ClipboardCheck className="h-4 w-4" /> Attach result
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'pharmacy' && (
        <div>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {data.pharmacies.map((p) => (
                <span key={p.id} className="badge bg-slate-100 text-slate-600">
                  <Building2 className="mr-1 h-3 w-3" /> {p.name}
                </span>
              ))}
            </div>
            {can('pharmacy.send') && (
              <button className="btn-primary" onClick={() => setRxOpen(true)}>
                <Plus className="h-4 w-4" /> New e-prescription
              </button>
            )}
          </div>

          {data.prescriptions.length === 0 ? (
            <EmptyState icon={Pill} title="No prescriptions" message="Send an electronic prescription to a partner pharmacy." />
          ) : (
            <div className="space-y-3">
              {data.prescriptions.map((r) => (
                <div key={r.id} className="card flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-800">{r.medication}</p>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className="text-sm text-slate-500">{r.dosage} · Qty {r.quantity}</p>
                    <p className="text-xs text-slate-400">
                      {fullName(data.getPatient(r.patientId))} → {data.pharmacies.find((p) => p.id === r.pharmacyId)?.name} · {fmtDate(r.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <LabOrderModal open={labOpen} onClose={() => setLabOpen(false)} />
      <ResultModal order={resultFor} onClose={() => setResultFor(null)} />
      <PrescriptionModal open={rxOpen} onClose={() => setRxOpen(false)} />
    </div>
  )

  function LabOrderModal({ open, onClose }) {
    const [patientId, setPatientId] = useState(data.patients[0]?.id)
    const [test, setTest] = useState('Full blood count')
    const submit = (e) => {
      e.preventDefault()
      data.addLabOrder({ patientId, doctorId: user.id, test })
      toast(`Lab order raised: ${test}`, { title: 'Lab order sent' })
      onClose()
    }
    return (
      <Modal open={open} onClose={onClose} title="New lab order">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Patient">
            <select className="input" value={patientId} onChange={(e) => setPatientId(e.target.value)}>
              {data.patients.map((p) => (
                <option key={p.id} value={p.id}>{fullName(p)}</option>
              ))}
            </select>
          </Field>
          <Field label="Test">
            <select className="input" value={test} onChange={(e) => setTest(e.target.value)}>
              <option>Full blood count</option>
              <option>Lipid panel</option>
              <option>HbA1c</option>
              <option>Urea & Electrolytes</option>
              <option>Liver function test</option>
              <option>Thyroid function test</option>
              <option>Urine dipstick</option>
            </select>
          </Field>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary"><FlaskConical className="h-4 w-4" /> Raise order</button>
          </div>
        </form>
      </Modal>
    )
  }

  function ResultModal({ order, onClose }) {
    const [result, setResult] = useState('')
    const submit = (e) => {
      e.preventDefault()
      if (!result.trim()) return
      data.attachLabResult(order.id, result)
      toast('Lab result attached to patient record', { title: 'Result recorded' })
      setResult('')
      onClose()
    }
    return (
      <Modal open={!!order} onClose={onClose} title={order ? `Attach result · ${order.test}` : ''}>
        {order && (
          <form onSubmit={submit} className="space-y-4">
            <p className="text-sm text-slate-500">
              Patient: <span className="font-medium text-slate-700">{fullName(data.getPatient(order.patientId))}</span>
            </p>
            <Field label="Result">
              <textarea
                className="input min-h-[100px]"
                value={result}
                onChange={(e) => setResult(e.target.value)}
                placeholder="e.g. Hb 13.5 g/dL — within normal range"
                autoFocus
              />
            </Field>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-primary"><ClipboardCheck className="h-4 w-4" /> Save result</button>
            </div>
          </form>
        )}
      </Modal>
    )
  }

  function PrescriptionModal({ open, onClose }) {
    const [f, setF] = useState({
      patientId: data.patients[0]?.id,
      medication: '',
      dosage: '',
      quantity: 30,
      pharmacyId: data.pharmacies[0]?.id,
    })
    const set = (k, v) => setF((x) => ({ ...x, [k]: v }))
    const submit = (e) => {
      e.preventDefault()
      if (!f.medication.trim()) return
      data.sendPrescription({ ...f, doctorId: user.id, quantity: Number(f.quantity) })
      const ph = data.pharmacies.find((p) => p.id === f.pharmacyId)
      toast(`Sent to ${ph?.name}`, { title: 'E-prescription sent', type: 'message' })
      onClose()
      setF({ patientId: data.patients[0]?.id, medication: '', dosage: '', quantity: 30, pharmacyId: data.pharmacies[0]?.id })
    }
    return (
      <Modal open={open} onClose={onClose} title="New e-prescription">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Patient">
            <select className="input" value={f.patientId} onChange={(e) => set('patientId', e.target.value)}>
              {data.patients.map((p) => (
                <option key={p.id} value={p.id}>{fullName(p)}</option>
              ))}
            </select>
          </Field>
          <Field label="Medication">
            <input className="input" value={f.medication} onChange={(e) => set('medication', e.target.value)} placeholder="e.g. Amoxicillin 500mg" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Dosage">
              <input className="input" value={f.dosage} onChange={(e) => set('dosage', e.target.value)} placeholder="1 tab 8-hourly" />
            </Field>
            <Field label="Quantity">
              <input type="number" min="1" className="input" value={f.quantity} onChange={(e) => set('quantity', e.target.value)} />
            </Field>
          </div>
          <Field label="Partner pharmacy">
            <select className="input" value={f.pharmacyId} onChange={(e) => set('pharmacyId', e.target.value)}>
              {data.pharmacies.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </Field>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary"><Pill className="h-4 w-4" /> Send prescription</button>
          </div>
        </form>
      </Modal>
    )
  }
}
