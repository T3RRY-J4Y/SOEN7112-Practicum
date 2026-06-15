import { useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Pencil,
  Stethoscope,
  FlaskConical,
  Pill,
  Receipt,
  AlertTriangle,
  HeartPulse,
  Lock,
  Plus,
} from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { PageHeader, Modal, Field, StatusBadge, EmptyState } from '../components/ui.jsx'
import { fullName, age, fmtDate, money, invoiceTotal, invoiceBalance } from '../lib/utils.js'

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="text-right font-medium text-slate-700">{value || '—'}</span>
    </div>
  )
}

export default function PatientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const data = useData()
  const { user, can } = useAuth()
  const { toast } = useToast()
  const patient = data.getPatient(id)

  const [tab, setTab] = useState('overview')
  const [editOpen, setEditOpen] = useState(false)
  const [consultOpen, setConsultOpen] = useState(false)
  const [labOpen, setLabOpen] = useState(false)
  const [rxOpen, setRxOpen] = useState(false)

  const labs = useMemo(
    () => data.labOrders.filter((o) => o.patientId === id),
    [data.labOrders, id],
  )
  const scripts = useMemo(
    () => data.prescriptions.filter((r) => r.patientId === id),
    [data.prescriptions, id],
  )
  const invoices = useMemo(
    () => data.invoices.filter((inv) => inv.patientId === id),
    [data.invoices, id],
  )

  if (!patient) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Patient not found"
        message="This record may have been removed."
        action={<Link to="/patients" className="btn-secondary">Back to patients</Link>}
      />
    )
  }

  const canClinical = can('consultation.view')

  const TABS = [
    { key: 'overview', label: 'Overview' },
    ...(canClinical ? [{ key: 'clinical', label: 'Consultations' }] : []),
    { key: 'labs', label: 'Lab results' },
    { key: 'scripts', label: 'Prescriptions' },
    ...(can('billing.view') ? [{ key: 'billing', label: 'Billing' }] : []),
  ]

  return (
    <div>
      <button
        onClick={() => navigate('/patients')}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" /> All patients
      </button>

      <PageHeader
        title={fullName(patient)}
        subtitle={`${patient.gender} · ${age(patient.dob)} yrs · ${patient.idNumber}`}
        actions={
          can('patients.edit') && (
            <button className="btn-secondary" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" /> Edit details
            </button>
          )
        }
      />

      {/* Alerts */}
      {(patient.allergies?.length > 0 || patient.chronicConditions?.length > 0) && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="card border-rose-200 bg-rose-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-rose-700">
              <AlertTriangle className="h-4 w-4" /> Allergies
            </div>
            {patient.allergies?.length ? (
              <div className="flex flex-wrap gap-2">
                {patient.allergies.map((a) => (
                  <span key={a} className="badge bg-rose-100 text-rose-700">{a}</span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-rose-600/70">No known allergies</p>
            )}
          </div>
          <div className="card border-amber-200 bg-amber-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-700">
              <HeartPulse className="h-4 w-4" /> Chronic conditions
            </div>
            {patient.chronicConditions?.length ? (
              <div className="flex flex-wrap gap-2">
                {patient.chronicConditions.map((c) => (
                  <span key={c} className="badge bg-amber-100 text-amber-700">{c}</span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-amber-600/70">None recorded</p>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap gap-1 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
              tab === t.key
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="card p-5">
            <h2 className="mb-2 font-semibold text-slate-800">Demographics</h2>
            <div className="divide-y divide-slate-100">
              <InfoRow label="Full name" value={fullName(patient)} />
              <InfoRow label="Date of birth" value={fmtDate(patient.dob)} />
              <InfoRow label="ID number" value={patient.idNumber} />
              <InfoRow label="Gender" value={patient.gender} />
              <InfoRow label="Phone" value={patient.phone} />
              <InfoRow label="Email" value={patient.email} />
              <InfoRow label="Address" value={patient.address} />
            </div>
          </section>
          <section className="card p-5">
            <h2 className="mb-2 font-semibold text-slate-800">Medical aid</h2>
            <div className="divide-y divide-slate-100">
              <InfoRow label="Scheme" value={patient.medicalAidScheme} />
              <InfoRow label="Member number" value={patient.medicalAidNumber} />
            </div>
            <h2 className="mb-2 mt-5 font-semibold text-slate-800">Recent visits</h2>
            {patient.visits?.length ? (
              <ul className="space-y-2">
                {patient.visits.slice(0, 4).map((v) => (
                  <li key={v.id} className="rounded-lg bg-slate-50 p-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-slate-700">{v.reason}</span>
                      <span className="text-slate-400">{fmtDate(v.date)}</span>
                    </div>
                    <p className="text-xs text-slate-400">{data.getUser(v.doctorId)?.name}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">No visits recorded.</p>
            )}
          </section>
        </div>
      )}

      {/* Clinical / consultations (doctor + admin only) */}
      {tab === 'clinical' && (
        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            {can('consultation.create') && (
              <button className="btn-primary" onClick={() => setConsultOpen(true)}>
                <Stethoscope className="h-4 w-4" /> New consultation
              </button>
            )}
            {can('lab.order') && (
              <button className="btn-secondary" onClick={() => setLabOpen(true)}>
                <FlaskConical className="h-4 w-4" /> Order lab test
              </button>
            )}
            {can('pharmacy.send') && (
              <button className="btn-secondary" onClick={() => setRxOpen(true)}>
                <Pill className="h-4 w-4" /> Send e-prescription
              </button>
            )}
          </div>
          {patient.visits?.length ? (
            <div className="space-y-3">
              {patient.visits.map((v) => (
                <div key={v.id} className="card p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800">{v.reason}</h3>
                    <span className="text-sm text-slate-400">{fmtDate(v.date)}</span>
                  </div>
                  <p className="text-sm text-slate-600">{v.notes}</p>
                  <p className="mt-2 text-xs text-slate-400">
                    Seen by {data.getUser(v.doctorId)?.name || 'Unknown'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Stethoscope}
              title="No consultation notes yet"
              message="Start a new consultation to record clinical notes."
            />
          )}
        </div>
      )}

      {/* Labs */}
      {tab === 'labs' && (
        <div className="space-y-3">
          {labs.length === 0 ? (
            <EmptyState icon={FlaskConical} title="No lab orders" message="No lab tests have been ordered for this patient." />
          ) : (
            labs.map((o) => (
              <div key={o.id} className="card flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{o.test}</p>
                  <p className="text-xs text-slate-400">
                    Ordered {fmtDate(o.orderedAt)} by {data.getUser(o.doctorId)?.name || '—'}
                  </p>
                  {o.result && <p className="mt-1 text-sm text-slate-600">Result: {o.result}</p>}
                </div>
                <StatusBadge status={o.status} />
              </div>
            ))
          )}
        </div>
      )}

      {/* Prescriptions */}
      {tab === 'scripts' && (
        <div className="space-y-3">
          {scripts.length === 0 ? (
            <EmptyState icon={Pill} title="No prescriptions" message="No e-prescriptions have been sent." />
          ) : (
            scripts.map((r) => (
              <div key={r.id} className="card flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-800">{r.medication}</p>
                  <p className="text-sm text-slate-600">{r.dosage} · Qty {r.quantity}</p>
                  <p className="text-xs text-slate-400">
                    {data.pharmacies.find((p) => p.id === r.pharmacyId)?.name} · {fmtDate(r.createdAt)}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))
          )}
        </div>
      )}

      {/* Billing */}
      {tab === 'billing' && (
        <div className="space-y-3">
          {invoices.length === 0 ? (
            <EmptyState icon={Receipt} title="No invoices" message="No invoices for this patient." />
          ) : (
            invoices.map((inv) => (
              <Link key={inv.id} to="/billing" className="card flex items-center justify-between p-5 hover:bg-slate-50">
                <div>
                  <p className="font-semibold text-slate-800">{inv.number}</p>
                  <p className="text-xs text-slate-400">{fmtDate(inv.date)} · {inv.items.length} items</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-800">{money(invoiceTotal(inv))}</p>
                  {invoiceBalance(inv) > 0 ? (
                    <p className="text-xs text-rose-600">Balance {money(invoiceBalance(inv))}</p>
                  ) : (
                    <StatusBadge status="paid" />
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {/* Receptionist note about restricted clinical access */}
      {!canClinical && (
        <div className="mt-6 flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-500">
          <Lock className="h-4 w-4" />
          Clinical consultation notes are only visible to clinical staff (doctors).
        </div>
      )}

      <EditPatientModal open={editOpen} onClose={() => setEditOpen(false)} patient={patient} />
      <ConsultationModal open={consultOpen} onClose={() => setConsultOpen(false)} patient={patient} />
      <LabOrderModal open={labOpen} onClose={() => setLabOpen(false)} patient={patient} />
      <PrescriptionModal open={rxOpen} onClose={() => setRxOpen(false)} patient={patient} />
    </div>
  )

  function EditPatientModal({ open, onClose, patient }) {
    const [f, setF] = useState({
      phone: patient.phone,
      email: patient.email,
      address: patient.address,
      medicalAidScheme: patient.medicalAidScheme,
      medicalAidNumber: patient.medicalAidNumber,
      allergies: (patient.allergies || []).join(', '),
      chronicConditions: (patient.chronicConditions || []).join(', '),
    })
    const set = (k, v) => setF((x) => ({ ...x, [k]: v }))
    const save = (e) => {
      e.preventDefault()
      data.updatePatient(patient.id, {
        phone: f.phone,
        email: f.email,
        address: f.address,
        medicalAidScheme: f.medicalAidScheme,
        medicalAidNumber: f.medicalAidNumber,
        allergies: f.allergies.split(',').map((s) => s.trim()).filter(Boolean),
        chronicConditions: f.chronicConditions.split(',').map((s) => s.trim()).filter(Boolean),
      })
      toast('Patient record updated')
      onClose()
    }
    return (
      <Modal open={open} onClose={onClose} title={`Edit · ${fullName(patient)}`} maxWidth="max-w-xl">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Phone"><input className="input" value={f.phone} onChange={(e) => set('phone', e.target.value)} /></Field>
            <Field label="Email"><input className="input" value={f.email} onChange={(e) => set('email', e.target.value)} /></Field>
            <Field label="Address" className="sm:col-span-2"><input className="input" value={f.address} onChange={(e) => set('address', e.target.value)} /></Field>
            <Field label="Medical aid scheme"><input className="input" value={f.medicalAidScheme} onChange={(e) => set('medicalAidScheme', e.target.value)} /></Field>
            <Field label="Medical aid number"><input className="input" value={f.medicalAidNumber} onChange={(e) => set('medicalAidNumber', e.target.value)} /></Field>
            <Field label="Allergies (comma separated)" className="sm:col-span-2"><input className="input" value={f.allergies} onChange={(e) => set('allergies', e.target.value)} /></Field>
            <Field label="Chronic conditions (comma separated)" className="sm:col-span-2"><input className="input" value={f.chronicConditions} onChange={(e) => set('chronicConditions', e.target.value)} /></Field>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Save changes</button>
          </div>
        </form>
      </Modal>
    )
  }

  function ConsultationModal({ open, onClose, patient }) {
    const [reason, setReason] = useState('')
    const [notes, setNotes] = useState('')
    const save = (e) => {
      e.preventDefault()
      if (!reason.trim()) return
      data.addVisit(patient.id, { reason, notes, doctorId: user.id })
      toast('Consultation note saved', { title: 'Consultation recorded' })
      setReason('')
      setNotes('')
      onClose()
    }
    return (
      <Modal open={open} onClose={onClose} title="New consultation">
        <form onSubmit={save} className="space-y-4">
          <Field label="Reason for visit">
            <input className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Follow-up review" />
          </Field>
          <Field label="Clinical notes">
            <textarea className="input min-h-[120px]" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Examination findings, assessment and plan…" />
          </Field>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Save consultation</button>
          </div>
        </form>
      </Modal>
    )
  }

  function LabOrderModal({ open, onClose, patient }) {
    const [test, setTest] = useState('Full blood count')
    const save = (e) => {
      e.preventDefault()
      data.addLabOrder({ patientId: patient.id, doctorId: user.id, test })
      toast(`Lab order raised: ${test}`, { title: 'Lab order sent' })
      onClose()
    }
    return (
      <Modal open={open} onClose={onClose} title="Order lab test">
        <form onSubmit={save} className="space-y-4">
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

  function PrescriptionModal({ open, onClose, patient }) {
    const [f, setF] = useState({
      medication: '',
      dosage: '',
      quantity: 30,
      pharmacyId: data.pharmacies[0]?.id,
    })
    const set = (k, v) => setF((x) => ({ ...x, [k]: v }))
    const save = (e) => {
      e.preventDefault()
      if (!f.medication.trim()) return
      data.sendPrescription({ patientId: patient.id, doctorId: user.id, ...f, quantity: Number(f.quantity) })
      const ph = data.pharmacies.find((p) => p.id === f.pharmacyId)
      toast(`Sent to ${ph?.name}`, { title: 'E-prescription sent', type: 'message' })
      onClose()
      setF({ medication: '', dosage: '', quantity: 30, pharmacyId: data.pharmacies[0]?.id })
    }
    return (
      <Modal open={open} onClose={onClose} title="Send e-prescription">
        <form onSubmit={save} className="space-y-4">
          <Field label="Medication">
            <input className="input" value={f.medication} onChange={(e) => set('medication', e.target.value)} placeholder="e.g. Amoxicillin 500mg" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
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
            <button type="submit" className="btn-primary"><Plus className="h-4 w-4" /> Send prescription</button>
          </div>
        </form>
      </Modal>
    )
  }
}
