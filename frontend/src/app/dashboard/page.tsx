'use client'

import { useQuery } from '@tanstack/react-query'
import { dashboard } from '@/lib/api'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from '@mui/material'
import {
  People as PeopleIcon,
  Person as ActiveIcon,
  Warning as WarningIcon,
  School as SchoolIcon,
  TrendingUp as TrendingIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Assignment as TaskIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material'
import Link from 'next/link'

interface StatCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  color: 'primary' | 'success' | 'error' | 'warning'
  trend?: string
}

function StatCard({ title, value, icon, color, trend }: StatCardProps) {
  const colorMap = {
    primary: { bg: '#eff6ff', icon: '#2563eb' },
    success: { bg: '#ecfdf5', icon: '#10b981' },
    error: { bg: '#fef2f2', icon: '#dc2626' },
    warning: { bg: '#fffbeb', icon: '#f59e0b' },
  }

  return (
    <Card sx={{ height: '100%', borderRadius: 2, transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 } }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontWeight: 500 }}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" sx={{ color: colorMap[color].icon }}>
              {value}
            </Typography>
            {trend && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <TrendingIcon sx={{ fontSize: 14, mr: 0.5, color: 'success.main' }} />
                {trend}
              </Typography>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: colorMap[color].bg,
              width: 56,
              height: 56,
            }}
          >
            <Box sx={{ color: colorMap[color].icon }}>{icon}</Box>
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboard.getMetrics,
  })

  const { data: enRiesgo } = useQuery({
    queryKey: ['en-riesgo'],
    queryFn: dashboard.getEnRiesgo,
  })

  const { data: actividades } = useQuery({
    queryKey: ['actividades-pendientes'],
    queryFn: dashboard.getActividadesPendientes,
  })

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
        Dashboard
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Estudiantes"
            value={metrics?.total_estudiantes || 0}
            icon={<PeopleIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Estudiantes Activos"
            value={metrics?.estudiantes_activos || 0}
            icon={<ActiveIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="En Riesgo"
            value={metrics?.estudiantes_en_riesgo || 0}
            icon={<WarningIcon />}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tasa Deserción"
            value={`${metrics?.tasa_desercion || 0}%`}
            icon={<SchoolIcon />}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight="bold">
                  Estudiantes en Riesgo
                </Typography>
                <Chip label={enRiesgo?.length || 0} size="small" color="error" />
              </Box>
              <Divider />
              {enRiesgo && enRiesgo.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {enRiesgo.slice(0, 5).map((est: any, index: number) => (
                    <ListItem
                      key={est.id}
                      sx={{
                        px: 2,
                        py: 1.5,
                        bgcolor: index % 2 === 0 ? 'transparent' : 'grey.50',
                        '&:hover': { bgcolor: 'grey.100' },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#fef2f2', color: '#dc2626' }}>
                          {est.nombre.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography fontWeight="600">
                            {est.nombre} {est.apellido}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {est.email}
                            </Typography>
                          </Box>
                        }
                        secondaryTypographyProps={{ component: 'div' }}
                      />
                      <Box sx={{ textAlign: 'right' }}>
                        <Chip
                          label={`${est.riesgo_desercion}%`}
                          size="small"
                          color={est.riesgo_desercion >= 60 ? 'error' : 'warning'}
                          sx={{ fontWeight: 'bold' }}
                        />
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                          {est.ultimo_contacto_dias} días sin contacto
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    No hay estudiantes en riesgo
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight="bold">
                  Actividades Pendientes
                </Typography>
                <Chip label={actividades?.length || 0} size="small" color="warning" />
              </Box>
              <Divider />
              {actividades && actividades.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {actividades.slice(0, 5).map((act: any, index: number) => (
                    <ListItem
                      key={act.id}
                      sx={{
                        px: 2,
                        py: 1.5,
                        bgcolor: index % 2 === 0 ? 'transparent' : 'grey.50',
                        '&:hover': { bgcolor: 'grey.100' },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: '#fffbeb', color: '#f59e0b' }}>
                          <TaskIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography fontWeight="600">
                            {act.titulo}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption" color="text.secondary">
                              {act.estudiante_nombre}
                            </Typography>
                          </Box>
                        }
                        secondaryTypographyProps={{ component: 'div' }}
                      />
                      <Box sx={{ textAlign: 'right' }}>
                        <Chip
                          label={act.estado.replace('_', ' ')}
                          size="small"
                          color={act.estado === 'pendiente' ? 'warning' : 'info'}
                          variant="outlined"
                          sx={{ textTransform: 'capitalize' }}
                        />
                        {act.fecha_limite && (
                          <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                            {new Date(act.fecha_limite).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    No hay actividades pendientes
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
