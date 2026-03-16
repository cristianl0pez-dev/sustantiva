import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tickets } from '../lib/api'
import { Box, Typography, Card, CardContent, Grid, Chip, TextField, Button, List, ListItem, ListItemAvatar, ListItemText, Avatar, Breadcrumbs } from '@mui/material'
import { Send } from '@mui/icons-material'
import { useState } from 'react'

export default function TicketDetail() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [respuesta, setRespuesta] = useState('')

  const { data: ticket, isLoading } = useQuery({ queryKey: ['ticket', id], queryFn: () => tickets.getById(Number(id)), enabled: !!id })

  const respuestaMutation = useMutation({
    mutationFn: ({ id, contenido }: { id: number; contenido: string }) => tickets.createInteraccion(id, { tipo: 'mensaje_saliente', contenido, canal: 'web' }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['ticket', id] }); setRespuesta('') }
  })

  if (isLoading) return <Box sx={{ p: 3 }}>Cargando...</Box>
  if (!ticket) return <Box sx={{ p: 3 }}>Ticket no encontrado</Box>

  return (
    <Box>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link to="/tickets" style={{ color: '#64748b' }}>Tickets</Link>
        <Typography color="text.primary">Ticket #{ticket.id}</Typography>
      </Breadcrumbs>

      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>{ticket.titulo}</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Descripción</Typography>
              <Typography>{ticket.descripcion}</Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Historial</Typography>
              <List>
                {ticket.interacciones?.map((i: any) => (
                  <ListItem key={i.id} sx={{ bgcolor: i.es_automatica ? 'action.hover' : 'transparent', borderRadius: 1, mb: 1 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: i.es_automatica ? 'info.main' : 'primary.main' }}>{i.es_automatica ? '🤖' : '📝'}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={i.tipo}
                      secondary={<><Typography variant="body2">{i.contenido}</Typography><Typography variant="caption" color="text.secondary">{new Date(i.created_at).toLocaleString()}</Typography></>}
                    />
                  </ListItem>
                ))}
              </List>
              {ticket.estado !== 'resuelto' && ticket.estado !== 'cerrado' && (
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <TextField placeholder="Escribe una respuesta..." value={respuesta} onChange={(e) => setRespuesta(e.target.value)} fullWidth multiline rows={2} />
                  <Button variant="contained" onClick={() => respuestaMutation.mutate({ id: Number(id), contenido: respuesta })} disabled={!respuesta.trim()} sx={{ alignSelf: 'flex-end' }}><Send /></Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Información</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">Estudiante</Typography>
                <Typography>{ticket.estudiante?.nombre} {ticket.estudiante?.apellido}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">Estado</Typography>
                <Box><Chip label={ticket.estado} color={ticket.estado === 'resuelto' ? 'success' : 'warning'} size="small" /></Box>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">Tipo</Typography>
                <Typography>{ticket.tipo}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">Fecha</Typography>
                <Typography>{new Date(ticket.fecha_creacion).toLocaleString()}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
