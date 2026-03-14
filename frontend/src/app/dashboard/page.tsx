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
} from '@mui/material'
import {
  People as PeopleIcon,
  Person as ActiveIcon,
  Warning as WarningIcon,
  School as SchoolIcon,
} from '@mui/icons-material'

interface StatCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  color: 'primary' | 'success' | 'error' | 'warning'
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="text.secondary" variant="body2">
              {title}
            </Typography>
            <Typography variant="h3" fontWeight="bold" color={`${color}.main`}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: `${color}.light`,
              color: `${color}.main`,
            }}
          >
            {icon}
          </Box>
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
      <Typography variant="h4" fontWeight="bold" gutterBottom>
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
            title="Activos"
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
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Estudiantes en Riesgo
              </Typography>
              <Box sx={{ mt: 2 }}>
                {enRiesgo?.slice(0, 5).map((est: any) => (
                  <Box
                    key={est.id}
                    sx={{
                      p: 2,
                      mb: 1,
                      bgcolor: 'error.light',
                      borderRadius: 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box>
                      <Typography fontWeight="bold">
                        {est.nombre} {est.apellido}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {est.bootcamp_nombre}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Chip
                        label={`${est.riesgo_desercion}%`}
                        size="small"
                        color="error"
                      />
                      <Typography variant="caption" display="block" color="text.secondary">
                        {est.ultimo_contacto_dias} días sin contacto
                      </Typography>
                    </Box>
                  </Box>
                ))}
                {(!enRiesgo || enRiesgo.length === 0) && (
                  <Typography color="text.secondary" align="center">
                    No hay estudiantes en riesgo
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Actividades Pendientes
              </Typography>
              <Box sx={{ mt: 2 }}>
                {actividades?.slice(0, 5).map((act: any) => (
                  <Box
                    key={act.id}
                    sx={{
                      p: 2,
                      mb: 1,
                      bgcolor: 'warning.light',
                      borderRadius: 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box>
                      <Typography fontWeight="bold">{act.titulo}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {act.estudiante_nombre}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Chip
                        label={act.estado}
                        size="small"
                        color="warning"
                      />
                      {act.fecha_limite && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          {new Date(act.fecha_limite).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
                {(!actividades || actividades.length === 0) && (
                  <Typography color="text.secondary" align="center">
                    No hay actividades pendientes
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
