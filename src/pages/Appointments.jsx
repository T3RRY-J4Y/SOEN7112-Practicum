import { useMemo, useState } from 'react'
import {
  CalendarDays,
  Plus,
  ChevronLeft,
  ChevronRight,
  Bell,
  BellRing,
  X,
  Check,
  Clock,
  CalendarClock,
} from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { PageHeader, Modal, Field, StatusBadge, EmptyState } from '../components/ui.jsx'
import { fullName, fmtTime, fmtDate, sameDay } from '../lib/utils.js'

const TIME_SLOTS = []
for (let h = 8; h <= 16; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:00`)
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:30`)
}

const startOfWeek = (date) => {
  const d = new Date(date)
  const day = (d.getDay() + 6) % 7 // Monday = 0
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

const toLocalInput = (date) => {
  const d = new Date(date)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

export default function Appointments() {
  const data = useData()
  const { can } = useAuth()
  const { toast } = useToast()
  const [view, setView] = useState('day')
  const [cursor, setCursor] = useState(new Date())
  const [bookOpen, setBookOpen] = useState(false)
  const [reschedule, setReschedule] = useState(null)

  const move = (dir) => {
    const d = new Date(cursor)
    d.setDate(d.getDate() + dir * (view === 'day' ? 1 : 7))
    setCursor(d)
  }

  const dayAppts = useMemo(
    () =>
      data.appointments
        .filter((a) => sameDay(a.start, cursor))
        .sort((a, b) => new Date(a.start) - new Date(b.start)),
    [data.appointments, cursor],
  )

  const weekDays = useMemo(() => {
    const start = startOfWeek(cursor)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      return d
    })
  }, [cursor])

  const sendReminder = (appt) => {
    data.markReminderSent(appt.id)
    const p = data.getPatient(appt.patientId)
    toast(
      `Reminder sent to ${p?.phone} and ${p?.email || 'email on file'} for ${fmtDate(appt.start)} at ${fmtTime(appt.start)}.`,
      { title: 'SMS & email reminder', type: 'message', duration: 6000 },
    )
  }

  const cancel = (appt) => {
    data.cancelAppointment(appt.id)
    toast('Appointment cancelled', { type: 'info' })
  }

  const complete = (appt) => {
    data.setAppointmentStatus(appt.id, 'completed')
    toast('Appointment marked completed')
  }

  return (
    <div>
      <PageHeader
        title="Appointments"
        subtitle="Book, reschedule and manage the clinic schedule."
        icon={CalendarDays}
        actions={
          can('appointments.manage') && (
            <button className="btn-primary" onClick={() => setBookOpen(true)}>
              <Plus className="h-4 w-4" /> Book appointment
            </button>
          )
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button className="btn-secondary" onClick={() => move(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button className="btn-secondary" onClick={() => setCursor(new Date())}>
            Today
          </button>
          <button className="btn-secondary" onClick={() => move(1)}>
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="ml-2 font-medium text-slate-700">
            {view === 'day'
              ? cursor.toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
              : `Week of ${fmtDate(startOfWeek(cursor))}`}
          </span>
        </div>
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
          {['day', 'week'].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium capitalize ${
                view === v ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {view === 'day' ? (
        dayAppts.length === 0 ? (
          <EmptyState icon={CalendarClock} title="No appointments" message="Nothing booked for this day." />
        ) : (
          <div className="space-y-3">
            {dayAppts.map((a) => {
              const cancelled = a.status === 'cancelled'
              return (
                <div
                  key={a.id}
                  className={`card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between ${
                    cancelled ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex w-20 flex-col items-center rounded-lg bg-brand-50 py-2 text-brand-700">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-semibold">{fmtTime(a.start)}</span>
                      <span className="text-[11px] text-brand-500">{a.durationMin} min</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{fullName(data.getPatient(a.patientId))}</p>
                      <p className="text-sm text-slate-500">{a.reason}</p>
                      <p className="text-xs text-slate-400">{data.getUser(a.doctorId)?.name}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={a.status} />
                    {!cancelled && a.status !== 'completed' && can('appointments.manage') && (
                      <>
                        <button
                          className={`btn-ghost ${a.reminderSent ? 'text-emerald-600' : ''}`}
                          onClick={() => sendReminder(a)}
                          title="Send reminder"
                        >
                          {a.reminderSent ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                          {a.reminderSent ? 'Reminded' : 'Remind'}
                        </button>
                        <button className="btn-ghost" onClick={() => setReschedule(a)}>
                          <CalendarClock className="h-4 w-4" /> Reschedule
                        </button>
                        <button className="btn-ghost text-emerald-600" onClick={() => complete(a)}>
                          <Check className="h-4 w-4" /> Complete
                        </button>
                        <button className="btn-ghost text-rose-600" onClick={() => cancel(a)}>
                          <X className="h-4 w-4" /> Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {weekDays.map((d) => {
            const items = data.appointments
              .filter((a) => sameDay(a.start, d) && a.status !== 'cancelled')
              .sort((x, y) => new Date(x.start) - new Date(y.start))
            const isToday = sameDay(d, new Date())
            return (
              <div key={d.toISOString()} className="card flex min-h-[140px] flex-col p-3">
                <div className={`mb-2 text-center text-sm font-semibold ${isToday ? 'text-brand-700' : 'text-slate-600'}`}>
                  {d.toLocaleDateString('en-ZA', { weekday: 'short' })}
                  <span className={`ml-1 ${isToday ? 'rounded-full bg-brand-600 px-2 py-0.5 text-white' : 'text-slate-400'}`}>
                    {d.getDate()}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {items.length === 0 && <p className="text-center text-xs text-slate-300">—</p>}
                  {items.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => {
                        setCursor(new Date(a.start))
                        setView('day')
                      }}
                      className="w-full rounded-md bg-brand-50 px-2 py-1.5 text-left text-xs hover:bg-brand-100"
                    >
                      <p className="font-semibold text-brand-700">{fmtTime(a.start)}</p>
                      <p className="truncate text-slate-600">{fullName(data.getPatient(a.patientId))}</p>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <BookingModal
        open={bookOpen || !!reschedule}
        onClose={() => {
          setBookOpen(false)
          setReschedule(null)
        }}
        existing={reschedule}
        defaultDate={toLocalInput(cursor)}
      />
    </div>
  )

  function BookingModal({ open, onClose, existing, defaultDate }) {
    const isEdit = !!existing
    const [f, setF] = useState(() => ({
      patientId: existing?.patientId || data.patients[0]?.id,
      doctorId: existing?.doctorId || data.users.find((u) => u.role === 'doctor')?.id,
      date: existing ? toLocalInput(existing.start) : defaultDate,
      time: existing ? fmtTime(existing.start).replace(/\s/g, '').slice(0, 5) : '09:00',
      durationMin: existing?.durationMin || 30,
      reason: existing?.reason || '',
    }))
    const [error, setError] = useState('')
    const set = (k, v) => setF((x) => ({ ...x, [k]: v }))

    const submit = (e) => {
      e.preventDefault()
      setError('')
      const start = new Date(`${f.date}T${f.time}:00`).toISOString()
      if (isEdit) {
        const res = data.rescheduleAppointment(existing.id, start, Number(f.durationMin), f.doctorId)
        if (!res.ok) return setError(res.error)
        toast('Appointment rescheduled')
      } else {
        const res = data.addAppointment({
          patientId: f.patientId,
          doctorId: f.doctorId,
          start,
          durationMin: Number(f.durationMin),
          reason: f.reason || 'Consultation',
        })
        if (!res.ok) {
          setError(res.error)
          toast(res.error, { type: 'error', title: 'Double booking blocked' })
          return
        }
        toast('Appointment booked')
      }
      onClose()
    }

    const doctors = data.users.filter((u) => u.role === 'doctor')

    return (
      <Modal open={open} onClose={onClose} title={isEdit ? 'Reschedule appointment' : 'Book appointment'}>
        <form onSubmit={submit} className="space-y-4">
          {!isEdit && (
            <Field label="Patient">
              <select className="input" value={f.patientId} onChange={(e) => set('patientId', e.target.value)}>
                {data.patients.map((p) => (
                  <option key={p.id} value={p.id}>{fullName(p)}</option>
                ))}
              </select>
            </Field>
          )}
          <Field label="Doctor">
            <select className="input" value={f.doctorId} onChange={(e) => set('doctorId', e.target.value)}>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Date">
              <input type="date" className="input" value={f.date} onChange={(e) => set('date', e.target.value)} />
            </Field>
            <Field label="Time">
              <select className="input" value={f.time} onChange={(e) => set('time', e.target.value)}>
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Duration">
              <select className="input" value={f.durationMin} onChange={(e) => set('durationMin', e.target.value)}>
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
              </select>
            </Field>
          </div>
          <Field label="Reason">
            <input className="input" value={f.reason} onChange={(e) => set('reason', e.target.value)} placeholder="Reason for visit" />
          </Field>

          {error && (
            <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
          )}

          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">{isEdit ? 'Save changes' : 'Book'}</button>
          </div>
        </form>
      </Modal>
    )
  }
}
