import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { auth } from '../lib/api'
import { Box, Card, CardContent, TextField, Button, Typography, Alert, Chip, Divider } from '@mui/material'
import { School as SchoolIcon, Email, Lock, Visibility, VisibilityOff, Person, AdminPanelSettings } from '@mui/icons-material'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await auth.login(email, password)
      login(data.access_token, data.refresh_token)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      }}
    >
      <Card sx={{ maxWidth: 440, width: '100%', mx: 2, borderRadius: 3 }}>
        <CardContent sx={{ p: 5 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <SchoolIcon sx={{ color: 'white', fontSize: 28 }} />
            </Box>
            <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
              Sustantiva
            </Typography>
            <Typography variant="body2" color="text.secondary">
              CRM para Bootcamps
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 2.5 }}
              InputProps={{
                startAdornment: <Email sx={{ color: 'text.secondary', mr: 1 }} />
              }}
            />
            <TextField
              fullWidth
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: <Lock sx={{ color: 'text.secondary', mr: 1 }} />,
                endAdornment: (
                  <Button onClick={() => setShowPassword(!showPassword)} sx={{ minWidth: 'auto' }}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </Button>
                )
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              {loading ? 'Iniciando...' : 'Iniciar sesión'}
            </Button>
          </form>

          <Divider sx={{ my: 3 }} />

          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, textAlign: 'center' }}>
              Cuentas de prueba
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box 
                onClick={() => { setEmail('admin@sustantiva.com'); setPassword('admin123') }}
                sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  border: '1px solid',
                  borderColor: 'divider',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AdminPanelSettings sx={{ fontSize: 18, color: 'primary.main' }} />
                  <Typography variant="body2" fontWeight="600">Administrador</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 3.5, display: 'block' }}>
                  admin@sustantiva.com / admin123
                </Typography>
              </Box>
              <Box 
                onClick={() => { setEmail('test@sustantiva.com'); setPassword('test123') }}
                sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  border: '1px solid',
                  borderColor: 'divider',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: 'action.hover', borderColor: 'secondary.main' }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person sx={{ fontSize: 18, color: 'secondary.main' }} />
                  <Typography variant="body2" fontWeight="600">Student Success</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 3.5, display: 'block' }}>
                  test@sustantiva.com / test123
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
