import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Search, UserPlus, ChevronRight } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { PageHeader, Modal, Field, EmptyState } from '../components/ui.jsx'
import { fullName, age, fmtDate } from '../lib/utils.js'

const blankForm = {
  firstName: '',
  lastName: '',
  idNumber: '',
  dob: '',
  gender: 'Female',
  phone: '',
  email: '',
  address: '',
  medicalAidScheme: '',
  medicalAidNumber: '',
  allergies: '',
  chronicConditions: '',
}

export default function Patients() {
  const data = useData()
  const { can } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(blankForm)
  const [errors, setErrors] = useState({})

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return data.patients
    return data.patients.filter((p) => {
      return (
        p.lastName.toLowerCase().includes(q) ||
        p.firstName.toLowerCase().includes(q) ||
        p.idNumber.toLowerCase().includes(q) ||
        (p.medicalAidNumber || '').toLowerCase().includes(q)
      )
    })
  }, [query, data.patients])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.firstName.trim()) errs.firstName = 'Required'
    if (!form.lastName.trim()) errs.lastName = 'Required'
    if (!form.idNumber.trim()) errs.idNumber = 'Required'
    if (!form.dob) errs.dob = 'Required'
    setErrors(errs)
    if (Object.keys(errs).length) return

    const patient = data.addPatient({
      ...form,
      allergies: form.allergies
        ? form.allergies.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      chronicConditions: form.chronicConditions
        ? form.chronicConditions.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    })
    toast(`${fullName(patient)} registered`, { title: 'Patient created' })
    setOpen(false)
    setForm(blankForm)
    navigate(`/patients/${patient.id}`)
  }

  return (
    <div>
      <PageHeader
        title="Patients"
        subtitle={`${data.patients.length} registered patients`}
        icon={Users}
        actions={
          can('patients.create') && (
            <button className="btn-primary" onClick={() => setOpen(true)}>
              <UserPlus className="h-4 w-4" />
              Register patient
            </button>
          )
        }
      />

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          className="input pl-10"
          placeholder="Search by surname, ID number or medical aid number…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Search} title="No matching patients" message="Try a different search term." />
      ) : (
        <div className="card overflow-hidden">
          <div className="hidden grid-cols-12 gap-2 border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 sm:grid">
            <div className="col-span-4">Patient</div>
            <div className="col-span-2">ID number</div>
            <div className="col-span-3">Medical aid</div>
            <div className="col-span-2">Phone</div>
            <div className="col-span-1" />
          </div>
          <ul className="divide-y divide-slate-100">
            {filtered.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => navigate(`/patients/${p.id}`)}
                  className="grid w-full grid-cols-1 items-center gap-1 px-5 py-3 text-left hover:bg-slate-50 sm:grid-cols-12 sm:gap-2"
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                      {p.firstName[0]}
                      {p.lastName[0]}
                    </span>
                    <div>
                      <p className="font-medium text-slate-800">{fullName(p)}</p>
                      <p className="text-xs text-slate-400">
                        {p.gender} · {age(p.dob)} yrs · DOB {fmtDate(p.dob)}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-2 text-sm text-slate-600">{p.idNumber}</div>
                  <div className="col-span-3 text-sm text-slate-600">
                    {p.medicalAidScheme || '—'}
                    {p.medicalAidNumber && (
                      <span className="block text-xs text-slate-400">{p.medicalAidNumber}</span>
                    )}
                  </div>
                  <div className="col-span-2 text-sm text-slate-600">{p.phone}</div>
                  <div className="col-span-1 hidden justify-end sm:flex">
                    <ChevronRight className="h-5 w-5 text-slate-300" />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Register new patient" maxWidth="max-w-2xl">
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="First name">
              <input className="input" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} />
              {errors.firstName && <p className="mt-1 text-xs text-rose-600">{errors.firstName}</p>}
            </Field>
            <Field label="Last name">
              <input className="input" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} />
              {errors.lastName && <p className="mt-1 text-xs text-rose-600">{errors.lastName}</p>}
            </Field>
            <Field label="ID number">
              <input className="input" value={form.idNumber} onChange={(e) => set('idNumber', e.target.value)} />
              {errors.idNumber && <p className="mt-1 text-xs text-rose-600">{errors.idNumber}</p>}
            </Field>
            <Field label="Date of birth">
              <input type="date" className="input" value={form.dob} onChange={(e) => set('dob', e.target.value)} />
              {errors.dob && <p className="mt-1 text-xs text-rose-600">{errors.dob}</p>}
            </Field>
            <Field label="Gender">
              <select className="input" value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                <option>Female</option>
                <option>Male</option>
                <option>Other</option>
              </select>
            </Field>
            <Field label="Phone">
              <input className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </Field>
            <Field label="Email" className="sm:col-span-2">
              <input className="input" value={form.email} onChange={(e) => set('email', e.target.value)} />
            </Field>
            <Field label="Address" className="sm:col-span-2">
              <input className="input" value={form.address} onChange={(e) => set('address', e.target.value)} />
            </Field>
            <Field label="Medical aid scheme">
              <input className="input" value={form.medicalAidScheme} onChange={(e) => set('medicalAidScheme', e.target.value)} />
            </Field>
            <Field label="Medical aid number">
              <input className="input" value={form.medicalAidNumber} onChange={(e) => set('medicalAidNumber', e.target.value)} />
            </Field>
            <Field label="Allergies (comma separated)" className="sm:col-span-2">
              <input className="input" value={form.allergies} onChange={(e) => set('allergies', e.target.value)} placeholder="e.g. Penicillin, Latex" />
            </Field>
            <Field label="Chronic conditions (comma separated)" className="sm:col-span-2">
              <input className="input" value={form.chronicConditions} onChange={(e) => set('chronicConditions', e.target.value)} placeholder="e.g. Hypertension" />
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <UserPlus className="h-4 w-4" />
              Register patient
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
