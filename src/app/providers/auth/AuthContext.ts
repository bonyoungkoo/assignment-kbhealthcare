import { createContext } from 'react'

export type AuthUser = { id: string; name: string; email: string }

export type AuthContextValue = {
  user: AuthUser | null
  setUser: (user: AuthUser | null) => void
  booting: boolean
  logout: () => void
  refreshAuth: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
