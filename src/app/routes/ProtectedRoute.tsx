import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { me } from '@/features/auth/api/auth.api'
import { CircularProgress, Box } from '@mui/material'
import { getAccessToken } from '@/shared/api/token' // 아래에서 만들 거
import { useAuth } from '../providers/auth/useAuth'

export const ProtectedRoute = () => {
  const { user, setUser } = useAuth()
  const location = useLocation()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const run = async () => {
      // 1) 토큰 없으면 즉시 로그인으로
      if (!getAccessToken()) {
        setChecking(false)
        return
      }

      // 2) 토큰 있으면 /me로 검증 (만료면 http.ts가 refresh 시도)
      try {
        const data = await me()
        setUser(data)
      } catch {
        setUser(null)
      } finally {
        setChecking(false)
      }
    }

    run()
  }, [setUser])

  if (checking) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!user) {
    const redirectTo = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirectTo=${redirectTo}`} replace />
  }

  return <Outlet />
}
