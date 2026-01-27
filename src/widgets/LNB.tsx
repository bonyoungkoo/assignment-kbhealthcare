import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import AssignmentIcon from '@mui/icons-material/Assignment'
import PersonIcon from '@mui/icons-material/Person'
import { NavLink, useLocation } from 'react-router-dom'

type LNBProps = {
  open: boolean
  onClose: () => void
  variant: 'permanent' | 'temporary'
  width?: number
  topOffset?: number
}

export default function LNB({ open, onClose, variant, width = 280, topOffset = 64 }: LNBProps) {
  const { pathname } = useLocation()

  const items = [
    { to: '/', label: '대시보드', icon: <DashboardIcon /> },
    { to: '/tasks', label: '할 일', icon: <AssignmentIcon /> },
    { to: '/profile', label: '회원정보', icon: <PersonIcon /> },
  ]

  const content = (
    <Box>
      {/* <Toolbar sx={{ minHeight: topOffset }} /> */}
      <Divider />
      <List sx={{ py: 1 }}>
        {items.map(item => {
          const selected = item.to === '/' ? pathname === '/' : pathname.startsWith(item.to)

          return (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              selected={selected}
              onClick={variant === 'temporary' ? onClose : undefined}
              sx={{ mx: 1, borderRadius: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          )
        })}
      </List>
    </Box>
  )

  return (
    <Drawer
      open={open}
      onClose={onClose}
      variant={variant}
      ModalProps={{ keepMounted: true }}
      sx={{
        width,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box',
          top: variant === 'permanent' ? `${topOffset}px` : undefined,
          height: variant === 'permanent' ? `calc(100% - ${topOffset}px)` : undefined,
        },
      }}
    >
      {content}
    </Drawer>
  )
}
