import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import { useNavigate } from 'react-router-dom'

type GNBProps = {
  onOpenLnb?: () => void
  showMenuButton?: boolean
}

export default function GNB({ onOpenLnb, showMenuButton = true }: GNBProps) {
  const navigate = useNavigate()

  return (
    <AppBar position="fixed" elevation={0}>
      <Toolbar sx={{ minHeight: 56 }}>
        {showMenuButton && (
          <IconButton edge="start" color="inherit" aria-label="open menu" onClick={onOpenLnb}>
            <MenuIcon />
          </IconButton>
        )}

        <Typography
          variant="h6"
          sx={{ ml: showMenuButton ? 1 : 0, cursor: 'pointer', userSelect: 'none' }}
          onClick={() => navigate('/')}
        >
          Logo
        </Typography>

        <Box sx={{ flex: 1 }} />

        <IconButton color="inherit" aria-label="profile" onClick={() => navigate('/profile')}>
          <AccountCircleIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  )
}
