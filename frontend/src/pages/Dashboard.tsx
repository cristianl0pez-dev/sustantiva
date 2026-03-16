import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { dashboard } from '../lib/api'
import { Grid, Card, CardContent, Typography, Box, Avatar, List, ListItemAvatar, ListItemText, Chip, CardActionArea, ListItemButton } from '@mui/material'
import { People, Person, Warning, School, Email } from '@mui/icons-material'

function StatCard({ title, value, icon, color, to }: { title: string; value: number | string; icon: React.ReactNode; color: string; to?: string }) {
  const colors: Record<string, { bg: string; icon: string }> = {
    primary: { bg: '#eff6ff', icon: '#2563eb' },
    success: { bg: '#ecfdf5', icon: '#10b981' },
    error: { bg: '#fef2f2', icon: '#dc2626' },
    warning: { bg: '#fffbeb', icon: '#f59e0b' },
  }
  
  const cardContent = (
    <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{title}</Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: colors[color].icon }}>{value}</Typography>
          </Box>
          <Avatar sx={{ bgcolor: colors[color].bg, width: 56, height: 56 }}>
            <Box sx={{ color: colors[color].icon }}>{icon}</Box>
          </Avatar>
        </Box>
      </CardContent>
  )

  if (to) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardActionArea component={Link} to={to} sx={{ height: '100%' }}>
          {cardContent}
        </CardActionArea>
      </Card>
    )
  }
  
  return (
    <Card sx={{ height: '100%' }}>
      {cardContent}
    </Card>
  )
}

export default function Dashboard() {
  const { data: metrics, isLoading: loadingMetrics } = useQuery({ queryKey: ['metrics'], queryFn: dashboard.getMetrics })
  const { data: enRiesgo } = useQuery({ queryKey: ['en-riesgo'], queryFn: dashboard.getEnRiesgo })

  if (loadingMetrics) return <Box sx={{ p: 3 }}>Cargando...</Box>

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>Dashboard</Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Estudiantes" value={metrics?.total_estudiantes || 0} icon={<People />} color="primary" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Estudiantes Activos" value={metrics?.estudiantes_activos || 0} icon={<Person />} color="success" to="/estudiantes?estado=activo" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="En Riesgo" value={metrics?.estudiantes_en_riesgo || 0} icon={<Warning />} color="error" to="/estudiantes?riesgo=true" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Tasa Deserción" value={`${metrics?.tasa_desercion || 0}%`} icon={<School />} color="warning" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Estudiantes en Riesgo</Typography>
              <List>
                {enRiesgo?.slice(0, 5).map((est: any) => (
                  <ListItemButton 
                    key={est.id} 
                    component={Link} 
                    to={`/estudiantes/${est.id}`}
                    sx={{ borderRadius: 1 }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#fef2f2', color: '#dc2626' }}>{est.nombre.charAt(0)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${est.nombre} ${est.apellido}`}
                      secondary={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Email sx={{ fontSize: 14 }} />{est.email}</Box>}
                    />
                    <Chip label={`${est.riesgo_desercion}%`} size="small" color={est.riesgo_desercion >= 60 ? 'error' : 'warning'} />
                  </ListItemButton>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
