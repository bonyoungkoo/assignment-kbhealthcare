import { Navigate, Outlet, useLocation } from 'react-router-dom'
// import { Box, CircularProgress } from '@mui/material'
import { useAuth } from '../providers/auth/useAuth'
import { Box, CircularProgress } from '@mui/material'

export const ProtectedRoute = () => {
  const { user, booting } = useAuth()
  const location = useLocation()

  if (booting) {
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
