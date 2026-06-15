import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, Info, AlertTriangle, X, MessageSquare } from 'lucide-react'

const ToastContext = createContext(null)

const ICONS = {
  success: CheckCircle2,
  info: Info,
  error: AlertTriangle,
  message: MessageSquare,
}

const STYLES = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  info: 'border-brand-200 bg-brand-50 text-brand-800',
  error: 'border-rose-200 bg-rose-50 text-rose-800',
  message: 'border-violet-200 bg-violet-50 text-violet-800',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const toast = useCallback(
    (message, { type = 'success', title, duration = 4000 } = {}) => {
      const id = Math.random().toString(36).slice(2)
      setToasts((t) => [...t, { id, message, type, title }])
      if (duration) setTimeout(() => dismiss(id), duration)
      return id
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => {
          const Icon = ICONS[t.type] || Info
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ${STYLES[t.type]}`}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="flex-1 text-sm">
                {t.title && <p className="font-semibold">{t.title}</p>}
                <p>{t.message}</p>
              </div>
              <button onClick={() => dismiss(t.id)} className="shrink-0 opacity-60 hover:opacity-100">
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
