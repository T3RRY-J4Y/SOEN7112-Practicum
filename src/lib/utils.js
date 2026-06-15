// Small shared helpers used across the app.

export const uid = (prefix = 'id') =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

export const money = (n) =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(Number(n) || 0)

export const fullName = (p) => (p ? `${p.firstName} ${p.lastName}` : 'Unknown patient')

export function age(dob) {
  if (!dob) return '—'
  const d = new Date(dob)
  const diff = Date.now() - d.getTime()
  return Math.abs(new Date(diff).getUTCFullYear() - 1970)
}

export const fmtDate = (value) => {
  if (!value) return '—'
  const d = new Date(value)
  return d.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const fmtTime = (value) => {
  if (!value) return '—'
  return new Date(value).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })
}

export const fmtDateTime = (value) => {
  if (!value) return '—'
  const d = new Date(value)
  return `${fmtDate(d)} · ${fmtTime(d)}`
}

export const sameDay = (a, b) => {
  const x = new Date(a)
  const y = new Date(b)
  return (
    x.getFullYear() === y.getFullYear() &&
    x.getMonth() === y.getMonth() &&
    x.getDate() === y.getDate()
  )
}

// Invoice money helpers
export const invoiceTotal = (inv) =>
  inv.items.reduce((sum, it) => sum + it.qty * it.unitPrice, 0)

export const invoicePaid = (inv) =>
  inv.payments.reduce((sum, p) => sum + Number(p.amount), 0)

export const invoiceBalance = (inv) => invoiceTotal(inv) - invoicePaid(inv)

export function invoiceStatus(inv) {
  const bal = invoiceBalance(inv)
  if (bal <= 0) return 'paid'
  if (invoicePaid(inv) > 0) return 'partial'
  return 'unpaid'
}
