import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ShieldCheck, Plus, ArrowRight } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { PageHeader, Modal, Field, StatusBadge, EmptyState } from '../components/ui.jsx'
import { fullName, money, fmtDate, invoiceTotal } from '../lib/utils.js'

const STATUS_FLOW = ['submitted', 'approved', 'rejected', 'paid']

export default function Claims() {
  const data = useData()
  const { can } = useAuth()
  const { toast } = useToast()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [preselectInvoice, setPreselectInvoice] = useState(null)

  // Allow the Billing page to deep-link "Submit claim" for a specific invoice.
  useEffect(() => {
    if (location.state?.invoiceId) {
      setPreselectInvoice(location.state.invoiceId)
      setOpen(true)
      window.history.replaceState({}, '')
    }
  }, [location.state])

  const changeStatus = (claim, status) => {
    data.updateClaimStatus(claim.id, status)
    toast(`Claim updated to "${status}"`, { type: status === 'rejected' ? 'error' : 'success' })
  }

  return (
    <div>
      <PageHeader
        title="Insurance Claims"
        subtitle="Submit claims to medical schemes and track their status."
        icon={ShieldCheck}
        actions={
          can('claims.manage') && (
            <button className="btn-primary" onClick={() => { setPreselectInvoice(null); setOpen(true) }}>
              <Plus className="h-4 w-4" /> Submit claim
            </button>
          )
        }
      />

      {data.claims.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="No claims yet" message="Submit a claim from a paid or unpaid invoice." />
      ) : (
        <div className="space-y-3">
          {data.claims.map((c) => {
            const inv = data.getInvoice(c.invoiceId)
            return (
              <div key={c.id} className="card p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-800">{c.scheme}</p>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="text-sm text-slate-500">
                      {fullName(data.getPatient(c.patientId))} · Member {c.memberNumber}
                    </p>
                    <p className="text-xs text-slate-400">
                      {inv ? inv.number : 'Invoice removed'} · Submitted {fmtDate(c.submittedAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-slate-800">{money(c.amount)}</p>
                  </div>
                </div>

                {/* Status timeline */}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  {c.history.map((h, i) => (
                    <span key={i} className="flex items-center gap-2">
                      {i > 0 && <ArrowRight className="h-3 w-3" />}
                      <span className="capitalize">{h.status}</span>
                      <span className="text-slate-300">({fmtDate(h.at)})</span>
                    </span>
                  ))}
                </div>

                {can('claims.manage') && (
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                    <span className="text-xs font-medium text-slate-400">Set status:</span>
                    {STATUS_FLOW.map((s) => (
                      <button
                        key={s}
                        disabled={c.status === s}
                        onClick={() => changeStatus(c, s)}
                        className={`badge capitalize transition ${
                          c.status === s
                            ? 'bg-slate-200 text-slate-400'
                            : 'border border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:bg-brand-50'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <SubmitClaimModal
        open={open}
        onClose={() => setOpen(false)}
        preselectInvoice={preselectInvoice}
      />
    </div>
  )

  function SubmitClaimModal({ open, onClose, preselectInvoice }) {
    // Only invoices without an existing claim can be submitted.
    const claimable = data.invoices.filter((inv) => !data.claims.some((c) => c.invoiceId === inv.id))
    const [invoiceId, setInvoiceId] = useState(preselectInvoice || claimable[0]?.id || '')

    useEffect(() => {
      if (open) setInvoiceId(preselectInvoice || claimable[0]?.id || '')
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, preselectInvoice])

    const inv = data.getInvoice(invoiceId)
    const patient = inv ? data.getPatient(inv.patientId) : null

    const submit = (e) => {
      e.preventDefault()
      if (!inv) return
      data.submitClaim({
        invoiceId: inv.id,
        patientId: inv.patientId,
        scheme: patient?.medicalAidScheme || 'Unknown scheme',
        memberNumber: patient?.medicalAidNumber || '—',
        amount: invoiceTotal(inv),
      })
      toast(`Claim submitted to ${patient?.medicalAidScheme}`, { title: 'Claim submitted' })
      onClose()
    }

    return (
      <Modal open={open} onClose={onClose} title="Submit insurance claim">
        {claimable.length === 0 ? (
          <div>
            <p className="text-sm text-slate-500">Every invoice already has a claim attached.</p>
            <div className="mt-4 flex justify-end">
              <button className="btn-secondary" onClick={onClose}>Close</button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <Field label="Invoice">
              <select className="input" value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)}>
                {claimable.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.number} · {fullName(data.getPatient(i.patientId))} · {money(invoiceTotal(i))}
                  </option>
                ))}
              </select>
            </Field>
            {patient && (
              <div className="rounded-lg bg-slate-50 p-3 text-sm">
                <div className="flex justify-between"><span className="text-slate-400">Scheme</span><span className="font-medium">{patient.medicalAidScheme || '—'}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Member</span><span className="font-medium">{patient.medicalAidNumber || '—'}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Claim amount</span><span className="font-semibold">{money(invoiceTotal(inv))}</span></div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-primary"><ShieldCheck className="h-4 w-4" /> Submit claim</button>
            </div>
          </form>
        )}
      </Modal>
    )
  }
}
