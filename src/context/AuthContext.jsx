import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { buildSeed } from '../data/seed.js'
import { can as canDo } from '../lib/rbac.js'

const AuthContext = createContext(null)
const SESSION_KEY = 'ehr_session_v1'

// Auth reads the user list straight from the seed so login works before the
// DataProvider mounts. The credentials never change in this prototype.
const USERS = buildSeed().users

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      if (!raw) return null
      const { id } = JSON.parse(raw)
      return USERS.find((u) => u.id === id) || null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify({ id: user.id }))
    else localStorage.removeItem(SESSION_KEY)
  }, [user])

  const login = (username, password) => {
    const found = USERS.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password,
    )
    if (!found) return { ok: false, error: 'Invalid username or password.' }
    setUser(found)
    return { ok: true, user: found }
  }

  const logout = () => setUser(null)

  const can = (capability) => (user ? canDo(user.role, capability) : false)

  const value = useMemo(() => ({ user, users: USERS, login, logout, can }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
