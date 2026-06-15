import { useState } from 'react'
import { Receipt, Plus, Trash2, Wallet, FileText, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import { PageHeader, Modal, Field, StatusBadge, EmptyState } from '../components/ui.jsx'
import {
  fullName,
  money,
  fmtDate,
  invoiceTotal,
  invoicePaid,
  invoiceBalance,
  uid,
} from '../lib/utils.js'

const TYPE_LABEL = { consultation: 'Consultation', procedure: 'Procedure', medication: 'Medication' }

export default function Billing() {
  const data = useData()
  const { can } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [createOpen, setCreateOpen] = useState(false)
  const [payFor, setPayFor] = useState(null)
  const [expanded, setExpanded] = useState(null)

  const totalOutstanding = data.invoices.reduce((s, inv) => s + invoiceBalance(inv), 0)

  return (
    <div>
      <PageHeader
        title="Billing"
        subtitle="Itemised invoices, payments and outstanding balances."
        icon={Receipt}
        actions={
          can('billing.manage') && (
            <button className="btn-primary" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> New invoice
            </button>
          )
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-sm text-slate-400">Total invoices</p>
          <p className="text-2xl font-semibold text-slate-800">{data.invoices.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-400">Outstanding balance</p>
          <p className="text-2xl font-semibold text-rose-600">{money(totalOutstanding)}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-400">Collected</p>
          <p className="text-2xl font-semibold text-emerald-600">
            {money(data.invoices.reduce((s, inv) => s + invoicePaid(inv), 0))}
          </p>
        </div>
      </div>

      {data.invoices.length === 0 ? (
        <EmptyState icon={Receipt} title="No invoices yet" message="Generate an invoice from a consultation." />
      ) : (
        <div className="space-y-3">
          {data.invoices.map((inv) => {
            const isOpen = expanded === inv.id
            const claim = data.claims.find((c) => c.invoiceId === inv.id)
            return (
              <div key={inv.id} className="card overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : inv.id)}
                  className="flex w-full items-center justify-between gap-3 p-5 text-left hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 text-slate-500">
                      <FileText className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-slate-800">{inv.number}</p>
                      <p className="text-xs text-slate-400">
                        {fullName(data.getPatient(inv.patientId))} · {fmtDate(inv.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-slate-800">{money(invoiceTotal(inv))}</p>
                      {invoiceBalance(inv) > 0 ? (
                        <p className="text-xs text-rose-600">Bal {money(invoiceBalance(inv))}</p>
                      ) : (
                        <p className="text-xs text-emerald-600">Settled</p>
                      )}
                    </div>
                    <StatusBadge status={inv.status} />
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-slate-100 bg-slate-50/60 p-5">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                          <th className="pb-2">Item</th>
                          <th className="pb-2">Type</th>
                          <th className="pb-2 text-center">Qty</th>
                          <th className="pb-2 text-right">Unit</th>
                          <th className="pb-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {inv.items.map((it) => (
                          <tr key={it.id}>
                            <td className="py-2 text-slate-700">{it.description}</td>
                            <td className="py-2 text-slate-500">{TYPE_LABEL[it.type] || it.type}</td>
                            <td className="py-2 text-center text-slate-500">{it.qty}</td>
                            <td className="py-2 text-right text-slate-500">{money(it.unitPrice)}</td>
                            <td className="py-2 text-right font-medium text-slate-700">{money(it.qty * it.unitPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="mt-4 flex flex-col items-end gap-1 text-sm">
                      <div className="flex w-56 justify-between"><span className="text-slate-400">Total</span><span className="font-medium">{money(invoiceTotal(inv))}</span></div>
                      <div className="flex w-56 justify-between"><span className="text-slate-400">Paid</span><span className="font-medium text-emerald-600">{money(invoicePaid(inv))}</span></div>
                      <div className="flex w-56 justify-between border-t border-slate-200 pt-1"><span className="text-slate-500">Balance</span><span className="font-semibold text-rose-600">{money(invoiceBalance(inv))}</span></div>
                    </div>

                    {inv.payments.length > 0 && (
                      <div className="mt-4">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Payments</p>
                        <ul className="space-y-1 text-sm">
                          {inv.payments.map((p) => (
                            <li key={p.id} className="flex justify-between text-slate-600">
                              <span>{fmtDate(p.date)} · {p.method}</span>
                              <span>{money(p.amount)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {can('billing.manage') && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {invoiceBalance(inv) > 0 && (
                          <button className="btn-primary" onClick={() => setPayFor(inv)}>
                            <Wallet className="h-4 w-4" /> Record payment
                          </button>
                        )}
                        {!claim && can('claims.manage') && (
                          <button
                            className="btn-secondary"
                            onClick={() => navigate('/claims', { state: { invoiceId: inv.id } })}
                          >
                            <ShieldCheck className="h-4 w-4" /> Submit claim
                          </button>
                        )}
                        {claim && (
                          <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                            <ShieldCheck className="h-4 w-4" /> Claim {claim.status}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <CreateInvoiceModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <PaymentModal invoice={payFor} onClose={() => setPayFor(null)} />
    </div>
  )

  function CreateInvoiceModal({ open, onClose }) {
    const [patientId, setPatientId] = useState(data.patients[0]?.id)
    const [items, setItems] = useState([
      { id: uid('it'), description: 'Consultation', type: 'consultation', qty: 1, unitPrice: 650 },
    ])

    const setItem = (id, patch) =>
      setItems((arr) => arr.map((it) => (it.id === id ? { ...it, ...patch } : it)))
    const addItem = (type) =>
      setItems((arr) => [
        ...arr,
        {
          id: uid('it'),
          description: type === 'procedure' ? 'Procedure' : 'Medication',
          type,
          qty: 1,
          unitPrice: 0,
        },
      ])
    const removeItem = (id) => setItems((arr) => arr.filter((it) => it.id !== id))

    const total = items.reduce((s, it) => s + it.qty * it.unitPrice, 0)

    const submit = (e) => {
      e.preventDefault()
      if (items.length === 0) return
      const inv = data.addInvoice({
        patientId,
        items: items.map((it) => ({ ...it, qty: Number(it.qty), unitPrice: Number(it.unitPrice) })),
      })
      toast(`${inv.number} generated for ${money(total)}`, { title: 'Invoice created' })
      onClose()
      setItems([{ id: uid('it'), description: 'Consultation', type: 'consultation', qty: 1, unitPrice: 650 }])
    }

    return (
      <Modal open={open} onClose={onClose} title="Generate invoice" maxWidth="max-w-2xl">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Patient">
            <select className="input" value={patientId} onChange={(e) => setPatientId(e.target.value)}>
              {data.patients.map((p) => (
                <option key={p.id} value={p.id}>{fullName(p)}</option>
              ))}
            </select>
          </Field>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="label mb-0">Line items</span>
              <div className="flex gap-2">
                <button type="button" className="btn-ghost text-xs" onClick={() => addItem('procedure')}>
                  <Plus className="h-3.5 w-3.5" /> Procedure
                </button>
                <button type="button" className="btn-ghost text-xs" onClick={() => addItem('medication')}>
                  <Plus className="h-3.5 w-3.5" /> Medication
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {items.map((it) => (
                <div key={it.id} className="grid grid-cols-12 items-center gap-2">
                  <input
                    className="input col-span-6"
                    value={it.description}
                    onChange={(e) => setItem(it.id, { description: e.target.value })}
                  />
                  <input
                    type="number"
                    min="1"
                    className="input col-span-2"
                    value={it.qty}
                    onChange={(e) => setItem(it.id, { qty: e.target.value })}
                  />
                  <input
                    type="number"
                    min="0"
                    className="input col-span-3"
                    value={it.unitPrice}
                    onChange={(e) => setItem(it.id, { unitPrice: e.target.value })}
                  />
                  <button
                    type="button"
                    className="col-span-1 grid place-items-center text-slate-400 hover:text-rose-600"
                    onClick={() => removeItem(it.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <span className="text-sm text-slate-500">Total</span>
            <span className="text-xl font-semibold text-slate-800">{money(total)}</span>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary"><Receipt className="h-4 w-4" /> Generate invoice</button>
          </div>
        </form>
      </Modal>
    )
  }

  function PaymentModal({ invoice, onClose }) {
    const balance = invoice ? invoiceBalance(invoice) : 0
    const [amount, setAmount] = useState('')
    const [method, setMethod] = useState('Card')

    const submit = (e) => {
      e.preventDefault()
      const amt = Number(amount)
      if (!amt || amt <= 0) return
      data.recordPayment(invoice.id, amt, method)
      toast(`Payment of ${money(amt)} recorded`, { title: 'Payment received' })
      onClose()
      setAmount('')
    }

    return (
      <Modal open={!!invoice} onClose={onClose} title={invoice ? `Payment · ${invoice.number}` : ''}>
        {invoice && (
          <form onSubmit={submit} className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">Total</span><span>{money(invoiceTotal(invoice))}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Outstanding</span><span className="font-semibold text-rose-600">{money(balance)}</span></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Amount">
                <input type="number" min="0" step="0.01" className="input" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" autoFocus />
              </Field>
              <Field label="Method">
                <select className="input" value={method} onChange={(e) => setMethod(e.target.value)}>
                  <option>Card</option>
                  <option>Cash</option>
                  <option>EFT</option>
                  <option>Medical Aid</option>
                </select>
              </Field>
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn-secondary flex-1" onClick={() => setAmount(String(balance))}>
                Pay full ({money(balance)})
              </button>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-primary"><Wallet className="h-4 w-4" /> Record payment</button>
            </div>
          </form>
        )}
      </Modal>
    )
  }
}
