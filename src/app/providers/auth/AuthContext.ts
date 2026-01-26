import { createContext } from 'react'

export type AuthUser = { id: string; email: string; name: string }

export type AuthContextValue = {
  user: AuthUser | null
  setUser: (user: AuthUser | null) => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
