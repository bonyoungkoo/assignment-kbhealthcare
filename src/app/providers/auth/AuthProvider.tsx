import { useEffect, useMemo, useState } from 'react'
import { AuthContext, type AuthContextValue, type AuthUser } from './AuthContext'
import { me } from '@/features/auth/api/auth.api'
import { getRefreshToken, setAccessToken, setRefreshToken } from '@/shared/api/token'
import { http } from '@/shared/api/http'

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [booting, setBooting] = useState(true)

  const refreshAuth = async () => {
    const res = await http.post('/api/auth/refresh')
    console.log('res', res)
    if (!res.ok) {
      setAccessToken(null)
      setRefreshToken(null)
      setUser(null)
      return null
    }

    const { accessToken } = (await res.json()) as { accessToken: string }
    setAccessToken(accessToken)

    const user = (await me()) as AuthUser
    setUser(user)
    return user
  }

  useEffect(() => {
    const run = async () => {
      try {
        if (!getRefreshToken()) return
        await refreshAuth()
      } finally {
        setBooting(false)
      }
    }
    run()
  }, [])

  const logout = async () => {
    try {
      await http.post('/api/auth/logout')
    } finally {
      setAccessToken(null)
      setUser(null)
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({ user, setUser, booting, refreshAuth, logout }),
    [user, booting],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
