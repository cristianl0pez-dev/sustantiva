import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { estudiantes, notas } from '../lib/api'
import { useTheme } from '@mui/material/styles'
import { 
  Box, Typography, Card, CardContent, Chip, Avatar, Grid, 
  Button, TextField, Dialog, DialogTitle, DialogContent, 
  DialogActions, LinearProgress, IconButton, Paper, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  Divider, Alert, Snackbar, Stack
} from '@mui/material'
import { 
  ArrowBack, Phone, Email, WhatsApp, School, Warning,
  Add, Person, Notes, ConfirmationNumber, Schedule, CalendarMonth,
  AccessTime, TrendingUp, PersonPin
} from '@mui/icons-material'
import { useState } from 'react'

const getEstadoColor = (estado: string) => {
  const colors: Record<string, any> = { 
    nuevo: 'info', onboarding: 'secondary', activo: 'success', 
    necesita_seguimiento: 'warning', en_riesgo: 'error', 
    reactivado: 'success', abandono: 'error', graduado: 'success'
  }
  return colors[estado] || 'default'
}

const getDiasTranscurridos = (fecha: string | null) => {
  if (!fecha) return null
  const fechaDate = new Date(fecha)
  const hoy = new Date()
  const diffTime = hoy.getTime() - fechaDate.getTime()
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

const getDiasTexto = (dias: number | null) => {
  if (dias === null) return '-'
  if (dias === 0) return 'Hoy'
  if (dias === 1) return 'Ayer'
  if (dias < 7) return `${dias} días`
  if (dias < 30) return `${Math.floor(dias / 7)} semanas`
  return `${Math.floor(dias / 30)} meses`
}

const getAlertaDias = (dias: number | null, umbrales: { warning: number; error: number }) => {
  if (dias === null) return 'success'
  if (dias >= umbrales.error) return 'error'
  if (dias >= umbrales.warning) return 'warning'
  return 'success'
}

export default function EstudianteDetail() {
  const { id } = useParams()
  const theme = useTheme()
  const queryClient = useQueryClient()
  const [openNote, setOpenNote] = useState(false)
  const [note, setNote] = useState('')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })
  
  const { data: estudiante, isLoading } = useQuery({
    queryKey: ['estudiante', id],
    queryFn: () => estudiantes.getById(Number(id))
  })

  const { data: notasData } = useQuery({
    queryKey: ['notas', id],
    queryFn: () => notas.getAll(Number(id)),
    enabled: !!id
  })

  const createNoteMutation = useMutation({
    mutationFn: async ({ contenido }: { contenido: string }) => {
      return notas.create({ estudiante_id: Number(id), contenido })
    },
    onSuccess: () => {
      setSnackbar({ open: true, message: 'Nota guardada', severity: 'success' })
      setOpenNote(false)
      setNote('')
      queryClient.invalidateQueries({ queryKey: ['notas', id] })
    }
  })

  if (isLoading) {
    return <Box sx={{ p: 3 }}><LinearProgress /></Box>
  }

  if (!estudiante) {
    return <Box sx={{ p: 3 }}>Estudiante no encontrado</Box>
  }

  const diasSinContacto = getDiasTranscurridos(estudiante.ultimo_contacto)
  const diasSinAccesoMoodle = getDiasTranscurridos(estudiante.ultimo_acceso_moodle)

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton component={Link} to="/estudiantes">
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" fontWeight="bold" sx={{ color: 'text.primary' }}>
          Detalle del Estudiante
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Panel Izquierdo - Info Personal y Seguimiento */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Info Personal */}
            <Card sx={{ borderRadius: 3, bgcolor: theme.palette.mode === 'dark' ? 'rgba(30,41,59,0.5)' : 'white', border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: '1.5rem' }}>
                    {estudiante.nombre?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {estudiante.nombre} {estudiante.apellido}
                    </Typography>
                    <Chip 
                      label={estudiante.estado?.replace('_', ' ')} 
                      size="small" 
                      color={getEstadoColor(estudiante.estado)}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Email sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Typography variant="body2">{estudiante.email}</Typography>
                  </Box>
                  {estudiante.telefono && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone sx={{ color: 'text.secondary', fontSize: 20 }} />
                      <Typography variant="body2">{estudiante.telefono}</Typography>
                    </Box>
                  )}
                  {estudiante.whatsapp && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WhatsApp sx={{ color: 'success.main', fontSize: 20 }} />
                      <Typography variant="body2">{estudiante.whatsapp}</Typography>
                    </Box>
                  )}
                  {estudiante.bootcamp && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <School sx={{ color: 'text.secondary', fontSize: 20 }} />
                      <Typography variant="body2">{estudiante.bootcamp.nombre}</Typography>
                    </Box>
                  )}
                </Stack>

                <Divider sx={{ my: 2 }} />

                {/* Responsable */}
                {estudiante.responsable && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <PersonPin sx={{ color: 'text.secondary', fontSize: 20 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Responsable</Typography>
                      <Typography variant="body2" fontWeight="500">{estudiante.responsable.nombre}</Typography>
                    </Box>
                  </Box>
                )}

                {/* Riesgo */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TrendingUp sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">Riesgo de deserción</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="bold" color={estudiante.riesgo_desercion >= 60 ? 'error.main' : estudiante.riesgo_desercion >= 30 ? 'warning.main' : 'success.main'}>
                      {estudiante.riesgo_desercion}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={estudiante.riesgo_desercion}
                    color={estudiante.riesgo_desercion >= 60 ? 'error' : estudiante.riesgo_desercion >= 30 ? 'warning' : 'success'}
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
              </CardContent>
            </Card>

            {/* Fechas Importantes */}
            <Card sx={{ borderRadius: 3, bgcolor: theme.palette.mode === 'dark' ? 'rgba(30,41,59,0.5)' : 'white', border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Seguimiento</Typography>
                
                <Stack spacing={2}>
                  {/* Fecha Ingreso */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CalendarMonth sx={{ color: 'primary.main', fontSize: 22 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary">Fecha de ingreso</Typography>
                      <Typography variant="body2" fontWeight="500">
                        {estudiante.fecha_ingreso ? new Date(estudiante.fecha_ingreso).toLocaleDateString('es-ES') : '-'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Último Contacto */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <AccessTime sx={{ color: getAlertaDias(diasSinContacto, { warning: 7, error: 14 }) + '.main', fontSize: 22 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary">Último contacto</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight="500">
                          {estudiante.ultimo_contacto ? new Date(estudiante.ultimo_contacto).toLocaleDateString('es-ES') : 'Sin contacto'}
                        </Typography>
                        {diasSinContacto !== null && (
                          <Chip 
                            label={getDiasTexto(diasSinContacto)} 
                            size="small" 
                            color={getAlertaDias(diasSinContacto, { warning: 7, error: 14 })}
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>

                  {/* Último Acceso Moodle */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Schedule sx={{ color: getAlertaDias(diasSinAccesoMoodle, { warning: 3, error: 7 }) + '.main', fontSize: 22 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary">Último acceso Moodle</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight="500">
                          {estudiante.ultimo_acceso_moodle ? new Date(estudiante.ultimo_acceso_moodle).toLocaleString('es-ES') : 'Sin accesos'}
                        </Typography>
                        {diasSinAccesoMoodle !== null && (
                          <Chip 
                            label={getDiasTexto(diasSinAccesoMoodle)} 
                            size="small" 
                            color={getAlertaDias(diasSinAccesoMoodle, { warning: 3, error: 7 })}
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Panel Derecho - Notas, Conversaciones, Tickets */}
        <Grid item xs={12} md={8}>
          {/* Notas */}
          <Card sx={{ borderRadius: 3, mb: 3, bgcolor: theme.palette.mode === 'dark' ? 'rgba(30,41,59,0.5)' : 'white', border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Notes sx={{ color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight="bold">Notas de Seguimiento</Typography>
                </Box>
                <Button 
                  variant="contained" 
                  size="small" 
                  startIcon={<Add />}
                  onClick={() => setOpenNote(true)}
                >
                  Agregar Nota
                </Button>
              </Box>

              {notasData && notasData.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Autor</TableCell>
                        <TableCell>Contenido</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {notasData.map((nota: any) => (
                        <TableRow key={nota.id}>
                          <TableCell>{new Date(nota.fecha).toLocaleDateString('es-ES')}</TableCell>
                          <TableCell>{nota.autor?.nombre || 'Usuario'}</TableCell>
                          <TableCell>{nota.contenido}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="text.secondary">No hay notas registradas</Typography>
              )}
            </CardContent>
          </Card>

          {/* Conversaciones */}
          <Card sx={{ borderRadius: 3, mb: 3, bgcolor: theme.palette.mode === 'dark' ? 'rgba(30,41,59,0.5)' : 'white', border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person sx={{ color: 'secondary.main' }} />
                  <Typography variant="h6" fontWeight="bold">Conversaciones</Typography>
                </Box>
              </Box>

              {estudiante.conversaciones && estudiante.conversaciones.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Canal</TableCell>
                        <TableCell>Tipo</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {estudiante.conversaciones.map((conv: any) => (
                        <TableRow key={conv.id}>
                          <TableCell>{new Date(conv.created_at).toLocaleDateString('es-ES')}</TableCell>
                          <TableCell><Chip label={conv.canal} size="small" /></TableCell>
                          <TableCell>{conv.tipo}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="text.secondary">No hay conversaciones registradas</Typography>
              )}
            </CardContent>
          </Card>

          {/* Tickets */}
          <Card sx={{ borderRadius: 3, bgcolor: theme.palette.mode === 'dark' ? 'rgba(30,41,59,0.5)' : 'white', border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ConfirmationNumber sx={{ color: 'warning.main' }} />
                  <Typography variant="h6" fontWeight="bold">Tickets</Typography>
                </Box>
                <Button variant="contained" size="small" color="warning">
                  Crear Ticket
                </Button>
              </Box>

              {estudiante.tickets && estudiante.tickets.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Tipo</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell>Fecha</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {estudiante.tickets.map((ticket: any) => (
                        <TableRow key={ticket.id} component={Link} to={`/tickets/${ticket.id}`} sx={{ textDecoration: 'none', '&:hover': { bgcolor: 'action.hover' } }}>
                          <TableCell>#{ticket.id}</TableCell>
                          <TableCell>{ticket.tipo}</TableCell>
                          <TableCell><Chip label={ticket.estado} size="small" color={ticket.estado === 'resuelto' ? 'success' : 'warning'} /></TableCell>
                          <TableCell>{new Date(ticket.fecha_creacion).toLocaleDateString('es-ES')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="text.secondary">No hay tickets registrados</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Modal Nueva Nota */}
      <Dialog open={openNote} onClose={() => setOpenNote(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Agregar Nota de Seguimiento</DialogTitle>
        <DialogContent>
          <TextField
            multiline
            rows={4}
            fullWidth
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Escribe una nota sobre el seguimiento..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNote(false)}>Cancelar</Button>
          <Button 
            variant="contained" 
            onClick={() => createNoteMutation.mutate({ contenido: note })}
            disabled={!note.trim()}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

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
