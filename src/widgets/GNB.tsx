import { AppBar, Toolbar, IconButton, Box, Tooltip } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import AccountCircle from '@mui/icons-material/AccountCircle'
import LoginIcon from '@mui/icons-material/Login'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/providers/auth/useAuth'

type GNBProps = {
  onOpenLnb?: () => void
  showMenuButton: boolean
}

export default function GNB({ onOpenLnb, showMenuButton }: GNBProps) {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <AppBar position="fixed" elevation={0}>
      <Toolbar sx={{ minHeight: 56 }}>
        {user && showMenuButton && (
          <IconButton edge="start" color="inherit" aria-label="open menu" onClick={onOpenLnb}>
            <MenuIcon />
          </IconButton>
        )}

        {/* <Typography
          variant="h6"
          sx={{ ml: showMenuButton ? 1 : 0, cursor: 'pointer', userSelect: 'none' }}
          onClick={() => navigate('/')}
        >
          Logo
        </Typography> */}

        <Box sx={{ flex: 1 }} />

        {user ? (
          <Tooltip title="회원정보">
            <IconButton color="inherit" onClick={() => navigate('/profile')}>
              <AccountCircle />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="로그인">
            <IconButton color="inherit" onClick={() => navigate('/login')}>
              <LoginIcon />
            </IconButton>
          </Tooltip>
        )}
      </Toolbar>
    </AppBar>
  )
}
