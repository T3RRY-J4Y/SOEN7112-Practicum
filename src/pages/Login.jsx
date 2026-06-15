import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Plus, LogIn, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

const DEMO = [
  { role: 'Doctor', username: 'dmoyo', password: 'doctor123' },
  { role: 'Doctor', username: 'dpatel', password: 'doctor123' },
  { role: 'Receptionist', username: 'reception', password: 'front123' },
  { role: 'Administrator', username: 'admin', password: 'admin123' },
]

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  if (user) return <Navigate to="/" replace />

  const submit = (e) => {
    e.preventDefault()
    const res = login(username, password)
    if (!res.ok) {
      setError(res.error)
      return
    }
    navigate('/', { replace: true })
  }

  const quickFill = (d) => {
    setUsername(d.username)
    setPassword(d.password)
    setError('')
  }

  return (
    <div className="grid min-h-full lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between bg-brand-700 p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/15">
            <Plus className="h-6 w-6" strokeWidth={3} />
          </span>
          <span className="text-lg font-semibold">Riverside EHR</span>
        </div>
        <div>
          <h1 className="text-4xl font-semibold leading-tight">
            Integrated care for the Riverside Suburban Medical Clinic.
          </h1>
          <p className="mt-4 max-w-md text-brand-100">
            One secure record for appointments, consultations, billing, claims, lab results and
            pharmacy - built around the people you care for.
          </p>
        </div>
        <p className="text-sm text-brand-200">Prototype · SOEN7112 Practicum</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-slate-100 p-6">
        <div className="card w-full max-w-md p-8">
          <div className="mb-6 lg:hidden">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-600 text-white">
                <Plus className="h-6 w-6" strokeWidth={3} />
              </span>
              <span className="text-lg font-semibold text-slate-800">Riverside EHR</span>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-slate-800">Sign in</h2>
          <p className="mt-1 text-sm text-slate-500">Use one of the demo accounts below.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="label">Username</label>
              <input
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. dmoyo"
                autoFocus
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full">
              <LogIn className="h-4 w-4" />
              Sign in
            </button>
          </form>

          <div className="mt-6">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
              Demo accounts (click to fill)
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO.map((d) => (
                <button
                  key={d.username}
                  onClick={() => quickFill(d)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-left text-xs hover:border-brand-300 hover:bg-brand-50"
                >
                  <p className="font-semibold text-slate-700">{d.role}</p>
                  <p className="text-slate-400">{d.username} / {d.password}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
