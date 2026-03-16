import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { configRiesgo } from '../lib/api'
import { useTheme } from '@mui/material/styles'
import { 
  Box, Typography, Card, CardContent, Slider, Button, 
  LinearProgress, Grid, Alert, Snackbar, Divider
} from '@mui/material'
import { Warning, PlayArrow, Save, History, TrendingUp, CheckCircle } from '@mui/icons-material'
import { useState, useEffect } from 'react'

export default function RiesgoConfig() {
  const theme = useTheme()
  const queryClient = useQueryClient()
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })

  const { data: config, isLoading } = useQuery({
    queryKey: ['config-riesgo'],
    queryFn: configRiesgo.get
  })

  const [values, setValues] = useState({
    umbral_riesgo: 60,
    dias_sin_moodle: 7,
    dias_sin_contacto: 14
  })

  useEffect(() => {
    if (config) {
      setValues({
        umbral_riesgo: config.umbral_riesgo,
        dias_sin_moodle: config.dias_sin_moodle,
        dias_sin_contacto: config.dias_sin_contacto
      })
    }
  }, [config])

  const updateMutation = useMutation({
    mutationFn: configRiesgo.update,
    onSuccess: (data) => {
      setValues({
        umbral_riesgo: data.umbral_riesgo,
        dias_sin_moodle: data.dias_sin_moodle,
        dias_sin_contacto: data.dias_sin_contacto
      })
      setSnackbar({ open: true, message: 'Configuración guardada', severity: 'success' })
      queryClient.invalidateQueries({ queryKey: ['config-riesgo'] })
    },
    onError: () => {
      setSnackbar({ open: true, message: 'Error al guardar', severity: 'error' })
    }
  })

  const evaluarMutation = useMutation({
    mutationFn: configRiesgo.evaluar,
    onSuccess: (data) => {
      setSnackbar({ 
        open: true, 
        message: `Evaluación completada: ${data.tickets_creados} tickets creados`, 
        severity: 'success' 
      })
      queryClient.invalidateQueries({ queryKey: ['config-riesgo'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] })
    },
    onError: () => {
      setSnackbar({ open: true, message: 'Error al evaluar', severity: 'error' })
    }
  })

  if (isLoading) {
    return <Box sx={{ p: 3 }}><LinearProgress /></Box>
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: 'text.primary', mb: 1 }}>
          Configuración de Riesgo
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configura los parámetros para detectar estudiantes en riesgo de deserción
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Configuración */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, bgcolor: theme.palette.mode === 'dark' ? 'rgba(30,41,59,0.5)' : 'white', border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Warning sx={{ color: 'warning.main' }} />
                <Typography variant="h6" fontWeight="bold">Parámetros de Evaluación</Typography>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="body2" fontWeight="600" sx={{ mb: 1 }}>
                  Umbral de riesgo: {values.umbral_riesgo}%
                </Typography>
                <Slider
                  value={values.umbral_riesgo}
                  onChange={(_, v) => setValues({ ...values, umbral_riesgo: v as number })}
                  min={10}
                  max={100}
                  step={5}
                  marks={[
                    { value: 10, label: '10%' },
                    { value: 50, label: '50%' },
                    { value: 100, label: '100%' }
                  ]}
                  sx={{ color: 'warning.main' }}
                />
                <Typography variant="caption" color="text.secondary">
                  Por encima de este porcentaje se creará un ticket automáticamente
                </Typography>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="body2" fontWeight="600" sx={{ mb: 1 }}>
                  Días sin acceso Moodle: {values.dias_sin_moodle}
                </Typography>
                <Slider
                  value={values.dias_sin_moodle}
                  onChange={(_, v) => setValues({ ...values, dias_sin_moodle: v as number })}
                  min={1}
                  max={30}
                  marks={[
                    { value: 1, label: '1' },
                    { value: 15, label: '15' },
                    { value: 30, label: '30' }
                  ]}
                  sx={{ color: 'primary.main' }}
                />
                <Typography variant="caption" color="text.secondary">
                  Días sin acceder a Moodle para activar el riesgo
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" fontWeight="600" sx={{ mb: 1 }}>
                  Días sin contacto: {values.dias_sin_contacto}
                </Typography>
                <Slider
                  value={values.dias_sin_contacto}
                  onChange={(_, v) => setValues({ ...values, dias_sin_contacto: v as number })}
                  min={1}
                  max={60}
                  marks={[
                    { value: 1, label: '1' },
                    { value: 30, label: '30' },
                    { value: 60, label: '60' }
                  ]}
                  sx={{ color: 'primary.main' }}
                />
                <Typography variant="caption" color="text.secondary">
                  Días sin contacto para activar el riesgo
                </Typography>
              </Box>

              <Button 
                variant="contained" 
                startIcon={<Save />}
                onClick={() => updateMutation.mutate(values)}
                disabled={updateMutation.isPending}
                fullWidth
              >
                {updateMutation.isPending ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Evaluación */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, bgcolor: theme.palette.mode === 'dark' ? 'rgba(30,41,59,0.5)' : 'white', border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <PlayArrow sx={{ color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="bold">Evaluación</Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Ejecuta la evaluación de riesgo para todos los estudiantes y crea tickets automáticamente.
                </Typography>

                <Button 
                  variant="contained" 
                  color="warning"
                  startIcon={<TrendingUp />}
                  onClick={() => evaluarMutation.mutate()}
                  disabled={evaluarMutation.isPending}
                  fullWidth
                  size="large"
                  sx={{ py: 1.5 }}
                >
                  {evaluarMutation.isPending ? 'Evaluando...' : 'EVALUAR AHORA'}
                </Button>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <History sx={{ color: 'text.secondary', fontSize: 20 }} />
                <Typography variant="body2" fontWeight="600">Última Ejecución</Typography>
              </Box>

              {config?.ultima_ejecucion ? (
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'grey.50' 
                }}>
                  <Typography variant="body2">
                    <strong>Fecha:</strong> {new Date(config.ultima_ejecucion).toLocaleString('es-ES')}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Estudiantes evaluados:</strong> {config.estudiantes_evaluados || 0}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Tickets creados:</strong> {config.tickets_creados || 0}
                  </Typography>
                </Box>
              ) : (
                <Alert severity="info">
                  No se ha ejecutado ninguna evaluación aún.
                </Alert>
              )}

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                <Typography variant="body2" fontWeight="600">Configuración Actual</Typography>
              </Box>

              <Box sx={{ 
                p: 2, 
                borderRadius: 2, 
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'grey.50' 
              }}>
                <Typography variant="body2">
                  <strong>Umbral:</strong> {config?.umbral_riesgo || 60}%
                </Typography>
                <Typography variant="body2">
                  <strong>Sin Moodle:</strong> {config?.dias_sin_moodle || 7} días
                </Typography>
                <Typography variant="body2">
                  <strong>Sin Contacto:</strong> {config?.dias_sin_contacto || 14} días
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
