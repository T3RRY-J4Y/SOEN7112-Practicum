import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { LogOut, Menu, X } from 'lucide-react'
import Sidebar from './Sidebar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { ROLES } from '../lib/rbac.js'

export default function Layout() {
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const roleMeta = ROLES[user?.role] || ROLES.system

  const initials = user?.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')

  return (
    <div className="flex h-full">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <button
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className="hidden text-sm text-slate-400 sm:block">
            {new Date().toLocaleDateString('en-ZA', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right leading-tight">
              <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
              <span className={`badge ${roleMeta.color}`}>{roleMeta.label}</span>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white">
              {initials}
            </span>
            <button
              onClick={logout}
              className="btn-secondary"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
