import React, { useMemo, useState } from 'react'
import { AuthContext, type AuthContextValue } from './AuthContext'

export type AuthUser = { id: string; email: string; name: string }

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null)

  const value = useMemo<AuthContextValue>(() => ({ user, setUser }), [user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
