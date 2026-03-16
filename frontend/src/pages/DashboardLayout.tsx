import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useThemeMode } from '../main'
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  AppBar, Toolbar, Typography, Avatar, IconButton, Chip, Divider,
} from '@mui/material'
import {
  Dashboard, School, People, ConfirmationNumber, Logout, Menu, DarkMode, LightMode, Warning, Checklist,
} from '@mui/icons-material'

const drawerWidth = 260

const navigation = [
  { name: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
  { name: 'Tickets', path: '/tickets', icon: <ConfirmationNumber /> },
  { name: 'Bootcamps', path: '/bootcamps', icon: <School /> },
  { name: 'Estudiantes', path: '/estudiantes', icon: <People /> },
  { name: 'Riesgo', path: '/riesgo', icon: <Warning /> },
  { name: 'Asistencia', path: '/asistencia', icon: <Checklist /> },
]

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { mode, toggleTheme } = useThemeMode()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getRoleLabel = (rol: string) => {
    const labels: Record<string, string> = {
      admin: 'Administrador',
      student_success: 'Student Success',
      profesor: 'Profesor',
      mentor: 'Mentor',
    }
    return labels[rol] || rol
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <IconButton onClick={() => setMobileOpen(!mobileOpen)} sx={{ display: { sm: 'none' } }}>
            <Menu />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton onClick={toggleTheme} sx={{ mr: 1 }}>
            {mode === 'dark' ? <LightMode /> : <DarkMode />}
          </IconButton>
          <Chip label={getRoleLabel(user?.rol || '')} size="small" color="primary" sx={{ mr: 2 }} />
          <IconButton onClick={handleLogout}>
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth } }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth } }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          bgcolor: 'background.default',
          minHeight: '100vh',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}

const drawerContent = (
  <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    <Toolbar sx={{ px: 2, py: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography sx={{ color: 'white', fontWeight: 700 }}>S</Typography>
        </Box>
        <Typography variant="h6" fontWeight={700} sx={{ background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Sustantiva
        </Typography>
      </Box>
    </Toolbar>
    <Divider />
    <List sx={{ px: 1, flexGrow: 1 }}>
      {navigation.map((item) => (
        <ListItem key={item.name} disablePadding>
          <ListItemButton
            component={NavLink}
            to={item.path}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              '&.active': { bgcolor: 'primary.main', color: 'white', '& .MuiListItemIcon-root': { color: 'white' } },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.name} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
    <Divider />
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
        <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
          {'C'}
        </Avatar>
        <Box>
          <Typography variant="body2" fontWeight={600}>Usuario</Typography>
          <Typography variant="caption" color="text.secondary">Admin</Typography>
        </Box>
      </Box>
    </Box>
  </Box>
)
