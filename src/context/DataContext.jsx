import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { buildSeed } from '../data/seed.js'
import { useAuth } from './AuthContext.jsx'
import { invoiceStatus, uid } from '../lib/utils.js'

const DataContext = createContext(null)
const DB_KEY = 'ehr_db_v1'

function loadDB() {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* fall through to seed */
  }
  const seeded = buildSeed()
  localStorage.setItem(DB_KEY, JSON.stringify(seeded))
  return seeded
}

export function DataProvider({ children }) {
  const { user } = useAuth()
  const [db, setDb] = useState(loadDB)

  useEffect(() => {
    localStorage.setItem(DB_KEY, JSON.stringify(db))
  }, [db])

  // Append an audit entry describing a change. Called inside every mutator.
  const makeLog = useCallback(
    (action, entity, entityId, details) => ({
      id: uid('log'),
      at: new Date().toISOString(),
      actor: user?.name || 'System',
      role: user?.role || 'system',
      action,
      entity,
      entityId: String(entityId),
      details,
    }),
    [user],
  )

  // ---- Patients (FR03) ----
  const addPatient = useCallback(
    (data) => {
      const patient = {
        id: uid('p'),
        allergies: [],
        chronicConditions: [],
        visits: [],
        ...data,
      }
      setDb((d) => ({
        ...d,
        patients: [...d.patients, patient],
        auditLog: [
          makeLog('create', 'patient', patient.id, `Registered ${patient.firstName} ${patient.lastName}`),
          ...d.auditLog,
        ],
      }))
      return patient
    },
    [makeLog],
  )

  const updatePatient = useCallback(
    (id, patch, note) => {
      setDb((d) => ({
        ...d,
        patients: d.patients.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        auditLog: [makeLog('update', 'patient', id, note || 'Updated patient record'), ...d.auditLog],
      }))
    },
    [makeLog],
  )

  // ---- Consultation visits (FR10 hooks live here too) ----
  const addVisit = useCallback(
    (patientId, visit) => {
      const v = { id: uid('v'), date: new Date().toISOString().slice(0, 10), ...visit }
      setDb((d) => ({
        ...d,
        patients: d.patients.map((p) =>
          p.id === patientId ? { ...p, visits: [v, ...(p.visits || [])] } : p,
        ),
        auditLog: [makeLog('create', 'consultation', patientId, `Consultation note: ${v.reason}`), ...d.auditLog],
      }))
      return v
    },
    [makeLog],
  )

  // ---- Appointments (FR05/FR06) ----
  const findClash = useCallback(
    (doctorId, startISO, durationMin, ignoreId) => {
      const start = new Date(startISO).getTime()
      const end = start + durationMin * 60000
      return db.appointments.find((a) => {
        if (a.id === ignoreId) return false
        if (a.doctorId !== doctorId) return false
        if (a.status === 'cancelled') return false
        const aStart = new Date(a.start).getTime()
        const aEnd = aStart + a.durationMin * 60000
        return start < aEnd && aStart < end
      })
    },
    [db.appointments],
  )

  const addAppointment = useCallback(
    (data) => {
      const clash = findClash(data.doctorId, data.start, data.durationMin)
      if (clash) return { ok: false, error: 'This doctor already has an appointment in that slot.' }
      const appt = { id: uid('a'), status: 'scheduled', reminderSent: false, ...data }
      setDb((d) => ({
        ...d,
        appointments: [...d.appointments, appt],
        auditLog: [makeLog('create', 'appointment', appt.id, `Booked appointment (${data.reason})`), ...d.auditLog],
      }))
      return { ok: true, appointment: appt }
    },
    [findClash, makeLog],
  )

  const rescheduleAppointment = useCallback(
    (id, start, durationMin, doctorId) => {
      const clash = findClash(doctorId, start, durationMin, id)
      if (clash) return { ok: false, error: 'This doctor already has an appointment in that slot.' }
      setDb((d) => ({
        ...d,
        appointments: d.appointments.map((a) =>
          a.id === id ? { ...a, start, durationMin, doctorId } : a,
        ),
        auditLog: [makeLog('update', 'appointment', id, 'Rescheduled appointment'), ...d.auditLog],
      }))
      return { ok: true }
    },
    [findClash, makeLog],
  )

  const cancelAppointment = useCallback(
    (id) => {
      setDb((d) => ({
        ...d,
        appointments: d.appointments.map((a) => (a.id === id ? { ...a, status: 'cancelled' } : a)),
        auditLog: [makeLog('update', 'appointment', id, 'Cancelled appointment'), ...d.auditLog],
      }))
    },
    [makeLog],
  )

  const setAppointmentStatus = useCallback(
    (id, status) => {
      setDb((d) => ({
        ...d,
        appointments: d.appointments.map((a) => (a.id === id ? { ...a, status } : a)),
        auditLog: [makeLog('update', 'appointment', id, `Marked appointment ${status}`), ...d.auditLog],
      }))
    },
    [makeLog],
  )

  const markReminderSent = useCallback(
    (id) => {
      setDb((d) => ({
        ...d,
        appointments: d.appointments.map((a) => (a.id === id ? { ...a, reminderSent: true } : a)),
        auditLog: [makeLog('notify', 'appointment', id, 'Sent appointment reminder'), ...d.auditLog],
      }))
    },
    [makeLog],
  )

  // ---- Walk-in queue (FR07) ----
  const addToQueue = useCallback(
    (patientId, reason) => {
      const number =
        db.queue.reduce((max, q) => Math.max(max, q.number), 0) + 1
      const item = {
        id: uid('q'),
        number,
        patientId,
        reason,
        status: 'waiting',
        addedAt: new Date().toISOString(),
      }
      setDb((d) => ({
        ...d,
        queue: [...d.queue, item],
        auditLog: [makeLog('create', 'queue', item.id, `Added walk-in #${number}`), ...d.auditLog],
      }))
      return item
    },
    [db.queue, makeLog],
  )

  const callNext = useCallback(() => {
    const next = db.queue
      .filter((q) => q.status === 'waiting')
      .sort((a, b) => a.number - b.number)[0]
    if (!next) return null
    setDb((d) => ({
      ...d,
      queue: d.queue.map((q) =>
        q.id === next.id ? { ...q, status: 'in-consult' } : q,
      ),
      auditLog: [makeLog('update', 'queue', next.id, `Called walk-in #${next.number}`), ...d.auditLog],
    }))
    return next
  }, [db.queue, makeLog])

  const completeQueueItem = useCallback(
    (id) => {
      setDb((d) => ({
        ...d,
        queue: d.queue.map((q) => (q.id === id ? { ...q, status: 'done' } : q)),
        auditLog: [makeLog('update', 'queue', id, 'Completed walk-in'), ...d.auditLog],
      }))
    },
    [makeLog],
  )

  // ---- Billing (FR08) ----
  const addInvoice = useCallback(
    (data) => {
      const seq = db.invoices.length + 1001
      const invoice = {
        id: uid('inv'),
        number: `INV-${seq}`,
        date: new Date().toISOString().slice(0, 10),
        payments: [],
        status: 'unpaid',
        ...data,
      }
      invoice.status = invoiceStatus(invoice)
      setDb((d) => ({
        ...d,
        invoices: [invoice, ...d.invoices],
        auditLog: [makeLog('create', 'invoice', invoice.number, 'Generated invoice'), ...d.auditLog],
      }))
      return invoice
    },
    [db.invoices.length, makeLog],
  )

  const recordPayment = useCallback(
    (invoiceId, amount, method) => {
      setDb((d) => ({
        ...d,
        invoices: d.invoices.map((inv) => {
          if (inv.id !== invoiceId) return inv
          const updated = {
            ...inv,
            payments: [
              ...inv.payments,
              { id: uid('pay'), amount: Number(amount), method, date: new Date().toISOString().slice(0, 10) },
            ],
          }
          updated.status = invoiceStatus(updated)
          return updated
        }),
        auditLog: [makeLog('payment', 'invoice', invoiceId, `Recorded payment of R${amount} (${method})`), ...d.auditLog],
      }))
    },
    [makeLog],
  )

  // ---- Insurance claims (FR09) ----
  const submitClaim = useCallback(
    (data) => {
      const now = new Date().toISOString().slice(0, 10)
      const claim = {
        id: uid('cl'),
        status: 'submitted',
        submittedAt: now,
        history: [{ status: 'submitted', at: now }],
        ...data,
      }
      setDb((d) => ({
        ...d,
        claims: [claim, ...d.claims],
        auditLog: [makeLog('create', 'claim', claim.id, `Submitted claim to ${claim.scheme}`), ...d.auditLog],
      }))
      return claim
    },
    [makeLog],
  )

  const updateClaimStatus = useCallback(
    (id, status) => {
      const now = new Date().toISOString().slice(0, 10)
      setDb((d) => ({
        ...d,
        claims: d.claims.map((c) =>
          c.id === id ? { ...c, status, history: [...c.history, { status, at: now }] } : c,
        ),
        auditLog: [makeLog('update', 'claim', id, `Claim status → ${status}`), ...d.auditLog],
      }))
    },
    [makeLog],
  )

  // ---- Lab (FR10) ----
  const addLabOrder = useCallback(
    (data) => {
      const order = {
        id: uid('lab'),
        orderedAt: new Date().toISOString().slice(0, 10),
        status: 'pending',
        result: '',
        resultedAt: null,
        ...data,
      }
      setDb((d) => ({
        ...d,
        labOrders: [order, ...d.labOrders],
        auditLog: [makeLog('create', 'labOrder', order.id, `Ordered lab test: ${order.test}`), ...d.auditLog],
      }))
      return order
    },
    [makeLog],
  )

  const attachLabResult = useCallback(
    (id, result) => {
      setDb((d) => ({
        ...d,
        labOrders: d.labOrders.map((o) =>
          o.id === id
            ? { ...o, result, status: 'resulted', resultedAt: new Date().toISOString().slice(0, 10) }
            : o,
        ),
        auditLog: [makeLog('update', 'labOrder', id, 'Attached lab result'), ...d.auditLog],
      }))
    },
    [makeLog],
  )

  // ---- Pharmacy (FR10) ----
  const sendPrescription = useCallback(
    (data) => {
      const rx = {
        id: uid('rx'),
        status: 'sent',
        createdAt: new Date().toISOString().slice(0, 10),
        ...data,
      }
      setDb((d) => ({
        ...d,
        prescriptions: [rx, ...d.prescriptions],
        auditLog: [makeLog('create', 'prescription', rx.id, `E-prescription sent: ${rx.medication}`), ...d.auditLog],
      }))
      return rx
    },
    [makeLog],
  )

  const resetDemo = useCallback(() => {
    const seeded = buildSeed()
    setDb(seeded)
  }, [])

  const value = useMemo(
    () => ({
      ...db,
      addPatient,
      updatePatient,
      addVisit,
      findClash,
      addAppointment,
      rescheduleAppointment,
      cancelAppointment,
      setAppointmentStatus,
      markReminderSent,
      addToQueue,
      callNext,
      completeQueueItem,
      addInvoice,
      recordPayment,
      submitClaim,
      updateClaimStatus,
      addLabOrder,
      attachLabResult,
      sendPrescription,
      resetDemo,
      // lookups
      getPatient: (id) => db.patients.find((p) => p.id === id),
      getUser: (id) => db.users.find((u) => u.id === id),
      getInvoice: (id) => db.invoices.find((i) => i.id === id),
    }),
    [
      db,
      addPatient,
      updatePatient,
      addVisit,
      findClash,
      addAppointment,
      rescheduleAppointment,
      cancelAppointment,
      setAppointmentStatus,
      markReminderSent,
      addToQueue,
      callNext,
      completeQueueItem,
      addInvoice,
      recordPayment,
      submitClaim,
      updateClaimStatus,
      addLabOrder,
      attachLabResult,
      sendPrescription,
      resetDemo,
    ],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export const useData = () => {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
