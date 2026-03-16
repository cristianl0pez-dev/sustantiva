'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { tickets } from '@/lib/api'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material'
import {
  NavigateNext as NavigateNextIcon,
  ArrowBack as BackIcon,
  Send as SendIcon,
  CheckCircle as ResolvedIcon,
  Schedule as PendingIcon,
  Person as PersonIcon,
} from '@mui/icons-material'

const TIPO_LABELS: Record<string, string> = {
  acceso: 'Acceso',
  enlace_clase: 'Enlace Clase',
  tecnico: 'Técnico',
  materiales: 'Materiales',
  asistencia: 'Asistencia',
  evaluacion: 'Evaluación',
  tarea_feedback: 'Tarea/FEedback',
  administrativo: 'Administrativo',
  certificacion: 'Certificación',
  subsidio: 'Subsidio',
  otro: 'Otro',
}

const ESTADO_LABELS: Record<string, string> = {
  abierto: 'Abierto',
  en_proceso: 'En Proceso',
  espera: 'En Espera',
  resuelto: 'Resuelto',
  cerrado: 'Cerrado',
}

const PRIORIDAD_COLORS: Record<string, any> = {
  baja: 'success',
  media: 'warning',
  alta: 'error',
  urgente: 'error',
}

const NIVEL_LABELS: Record<string, string> = {
  nivel_1: 'Nivel 1 (Self-Service)',
  nivel_2: 'Nivel 2 (Técnico)',
  nivel_3: 'Nivel 3 (Académico)',
}

const INTERACCION_LABELS: Record<string, string> = {
  mensaje_entrante: 'Mensaje Entrante',
  mensaje_saliente: 'Mensaje Saliente',
  nota_interna: 'Nota Interna',
  cambio_estado: 'Cambio de Estado',
  asignacion: 'Asignación',
  respuesta_automatica: 'Respuesta Automática',
}

export default function TicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const ticketId = parseInt(params.id as string)
  
  const [respuesta, setRespuesta] = useState('')
  const [showCerrar, setShowCerrar] = useState(false)
  const [cierreData, setCierreData] = useState({ resolucion: '', cierre_tipo: '' })

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => tickets.getById(ticketId),
    enabled: !!ticketId,
  })

  const { data: opciones } = useQuery({
    queryKey: ['tickets-opciones'],
    queryFn: tickets.getOpciones,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => tickets.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] })
    },
  })

  const respuestaMutation = useMutation({
    mutationFn: ({ id, contenido }: { id: number; contenido: string }) => 
      tickets.createInteraccion(id, { 
        tipo: 'mensaje_saliente', 
        contenido,
        canal: 'web' 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] })
      setRespuesta('')
    },
  })

  const cerrarMutation = useMutation({
    mutationFn: ({ id, resolucion, cierre_tipo }: { id: number; resolucion: string; cierre_tipo: string }) => 
      tickets.cerrar(id, resolucion, cierre_tipo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] })
      setShowCerrar(false)
    },
  })

  const handleRespuesta = () => {
    if (!respuesta.trim()) return
    respuestaMutation.mutate({ id: ticketId, contenido: respuesta })
  }

  const handleCerrar = () => {
    if (!cierreData.resolucion || !cierreData.cierre_tipo) return
    cerrarMutation.mutate({ 
      id: ticketId, 
      resolucion: cierreData.resolucion, 
      cierre_tipo: cierreData.cierre_tipo 
    })
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!ticket) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography>Ticket no encontrado</Typography>
        <Button component={Link} href="/dashboard/tickets" sx={{ mt: 2 }}>
          Volver a Tickets
        </Button>
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 1 }}>
          <MuiLink component={Link} href="/dashboard/tickets" color="text.secondary" underline="hover">
            Tickets
          </MuiLink>
          <Typography color="text.primary">Ticket #{ticket.id}</Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" fontWeight="bold">
            {ticket.titulo}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {ticket.estado !== 'resuelto' && ticket.estado !== 'cerrado' && (
              <>
                <Button
                  variant="outlined"
                  onClick={() => setShowCerrar(!showCerrar)}
                  startIcon={<ResolvedIcon />}
                >
                  Resolver
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Box>

      {showCerrar && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Cerrar Ticket</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Resolución"
                  value={cierreData.resolucion}
                  onChange={(e) => setCierreData({ ...cierreData, resolucion: e.target.value })}
                  fullWidth
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Cierre</InputLabel>
                  <Select
                    value={cierreData.cierre_tipo}
                    label="Tipo de Cierre"
                    onChange={(e) => setCierreData({ ...cierreData, cierre_tipo: e.target.value })}
                  >
                    {opciones?.cierre_tipos?.map((t: string) => (
                      <MenuItem key={t} value={t}>{t.replace(/_/g, ' ')}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <Button
                  variant="contained"
                  onClick={handleCerrar}
                  disabled={cerrarMutation.isPending}
                  fullWidth
                >
                  {cerrarMutation.isPending ? 'Cerrando...' : 'Confirmar Cierre'}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Descripción</Typography>
              <Typography variant="body1">{ticket.descripcion}</Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Historial de Interacciones</Typography>
              <List>
                {ticket.interacciones?.map((interaccion: any) => (
                  <ListItem
                    key={interaccion.id}
                    sx={{
                      bgcolor: interaccion.es_automatica ? 'action.hover' : 'transparent',
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ 
                        bgcolor: interaccion.es_automatica ? 'info.main' : 
                                 interaccion.tipo === 'mensaje_entrante' ? 'success.main' : 
                                 interaccion.tipo === 'mensaje_saliente' ? 'primary.main' : 'grey.500'
                      }}>
                        {interaccion.es_automatica ? '🤖' : 
                         interaccion.tipo === 'mensaje_entrante' ? '📥' : 
                         interaccion.tipo === 'mensaje_saliente' ? '📤' : '📝'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" fontWeight={600}>
                            {INTERACCION_LABELS[interaccion.tipo] || interaccion.tipo}
                          </Typography>
                          {interaccion.es_automatica && (
                            <Chip label="Auto" size="small" color="info" sx={{ height: 20 }} />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {interaccion.contenido}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(interaccion.created_at).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>

              {ticket.estado !== 'resuelto' && ticket.estado !== 'cerrado' && (
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <TextField
                    placeholder="Escribe una respuesta..."
                    value={respuesta}
                    onChange={(e) => setRespuesta(e.target.value)}
                    fullWidth
                    multiline
                    rows={2}
                  />
                  <Button
                    variant="contained"
                    onClick={handleRespuesta}
                    disabled={respuestaMutation.isPending || !respuesta.trim()}
                    sx={{ alignSelf: 'flex-end' }}
                  >
                    <SendIcon />
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Información</Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">Estudiante</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {ticket.estudiante?.nombre?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {ticket.estudiante?.nombre} {ticket.estudiante?.apellido}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {ticket.estudiante?.email}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">Tipo</Typography>
                <Typography variant="body2">
                  {TIPO_LABELS[ticket.tipo] || ticket.tipo}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">Estado</Typography>
                <Box>
                  <Chip
                    label={ESTADO_LABELS[ticket.estado] || ticket.estado}
                    color={ticket.estado === 'resuelto' ? 'success' : ticket.estado === 'cerrado' ? 'default' : 'warning'}
                  />
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">Prioridad</Typography>
                <Box>
                  <Chip
                    label={ticket.prioridad}
                    color={PRIORIDAD_COLORS[ticket.prioridad]}
                    size="small"
                  />
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">Nivel</Typography>
                <Typography variant="body2">
                  {NIVEL_LABELS[ticket.nivel] || 'Sin asignar'}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">Fecha de Creación</Typography>
                <Typography variant="body2">
                  {new Date(ticket.fecha_creacion).toLocaleString()}
                </Typography>
              </Box>

              {ticket.fecha_cierre && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">Fecha de Cierre</Typography>
                  <Typography variant="body2">
                    {new Date(ticket.fecha_cierre).toLocaleString()}
                  </Typography>
                </Box>
              )}

              {ticket.resolucion && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary">Resolución</Typography>
                  <Typography variant="body2">
                    {ticket.resolucion}
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
