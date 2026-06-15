// Role-Based Access Control (FR01).
// Each permission lists the roles allowed to use it.

export const ROLES = {
  admin: { label: 'Administrator', color: 'bg-violet-100 text-violet-700' },
  doctor: { label: 'Doctor', color: 'bg-brand-100 text-brand-700' },
  receptionist: { label: 'Receptionist', color: 'bg-amber-100 text-amber-700' },
  system: { label: 'System', color: 'bg-slate-100 text-slate-600' },
}

// Capability => roles allowed
export const PERMISSIONS = {
  'dashboard.view': ['admin', 'doctor', 'receptionist'],
  'patients.view': ['admin', 'doctor', 'receptionist'],
  'patients.create': ['admin', 'doctor', 'receptionist'],
  'patients.edit': ['admin', 'doctor', 'receptionist'],
  // Clinical consultation notes are doctor-only (a receptionist cannot open them).
  'consultation.view': ['admin', 'doctor'],
  'consultation.create': ['doctor'],
  'appointments.view': ['admin', 'doctor', 'receptionist'],
  'appointments.manage': ['admin', 'doctor', 'receptionist'],
  'queue.view': ['admin', 'doctor', 'receptionist'],
  'queue.manage': ['admin', 'doctor', 'receptionist'],
  'billing.view': ['admin', 'receptionist', 'doctor'],
  'billing.manage': ['admin', 'receptionist'],
  'claims.view': ['admin', 'receptionist', 'doctor'],
  'claims.manage': ['admin', 'receptionist'],
  'lab.view': ['admin', 'doctor', 'receptionist'],
  'lab.order': ['doctor'],
  'lab.result': ['admin', 'doctor'],
  'pharmacy.send': ['doctor'],
  'audit.view': ['admin'],
}

export function can(role, capability) {
  const allowed = PERMISSIONS[capability]
  if (!allowed) return false
  return allowed.includes(role)
}
