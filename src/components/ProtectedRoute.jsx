import { Navigate, useLocation } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children, capability }) {
  const { user, can } = useAuth()
  const location = useLocation()

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  if (capability && !can(capability)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShieldAlert className="mb-4 h-14 w-14 text-rose-400" />
        <h1 className="text-xl font-semibold text-slate-800">Access restricted</h1>
        <p className="mt-1 max-w-md text-sm text-slate-500">
          Your role ({user.role}) does not have permission to view this page. Contact an
          administrator if you believe this is an error.
        </p>
      </div>
    )
  }

  return children
}
