import { Outlet } from 'react-router-dom'
import { Box, useMediaQuery } from '@mui/material'
import { useState } from 'react'
import GNB from '../GNB'
import LNB from '../LNB'
import { useTheme } from '@mui/material/styles'
import { useAuth } from '@/app/providers/auth/useAuth'

const APPBAR_H = 64
const LNB_W = 280

export function AppLayout() {
  const { user } = useAuth()
  const theme = useTheme()
  const mdUp = useMediaQuery(theme.breakpoints.up('md'))
  const [mobileOpen, setMobileOpen] = useState(false)

  const open = mdUp ? true : mobileOpen

  const handleOpenLnb = () => setMobileOpen(true)
  const handleCloseLnb = () => setMobileOpen(false)

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <GNB onOpenLnb={handleOpenLnb} showMenuButton={!mdUp} />

      <Box sx={{ display: 'flex', minHeight: `calc(100vh - ${APPBAR_H}px)` }}>
        {user ? (
          <LNB
            open={open}
            variant={mdUp ? 'permanent' : 'temporary'}
            width={LNB_W}
            topOffset={APPBAR_H}
            onClose={handleCloseLnb}
          />
        ) : null}

        <Box component="main" sx={{ flex: 1, marginTop: '64px', minWidth: 0 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
