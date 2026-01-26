import { AppBar, Toolbar, Typography, IconButton, Box, MenuItem, Menu } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { AccountCircle } from '@mui/icons-material'
import { useAuth } from '@/app/providers/auth/useAuth'

type GNBProps = {
  onOpenLnb?: () => void
  showMenuButton?: boolean
}

export default function GNB({ onOpenLnb, showMenuButton = true }: GNBProps) {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

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

        <IconButton onClick={handleOpen}>
          <AccountCircle />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem
            onClick={() => {
              handleClose()
              navigate('/profile')
            }}
          >
            회원정보
          </MenuItem>

          <MenuItem
            onClick={() => {
              handleClose()
              logout()
              navigate('/login', { replace: true })
            }}
          >
            로그아웃
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}
