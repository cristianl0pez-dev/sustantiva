import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { tickets } from '../lib/api'
import { Box, Typography, TextField, InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Avatar, IconButton } from '@mui/material'
import { Search, Visibility } from '@mui/icons-material'
import { useState } from 'react'

const TIPO_LABELS: Record<string, string> = { acceso: 'Acceso', enlace_clase: 'Enlace Clase', tecnico: 'Técnico', materiales: 'Materiales', asistencia: 'Asistencia', evaluacion: 'Evaluación', tarea_feedback: 'Tarea', administrativo: 'Admin', certificacion: 'Certificación', subsidio: 'Subsidio', otro: 'Otro' }
const ESTADO_LABELS: Record<string, string> = { abierto: 'Abierto', en_proceso: 'En Proceso', resuelto: 'Resuelto', cerrado: 'Cerrado' }

export default function Tickets() {
  const [search, setSearch] = useState('')
  const { data: ticketsList, isLoading } = useQuery({ queryKey: ['tickets'], queryFn: () => tickets.getAll() })

  const filtered = ticketsList?.filter((t: any) =>
    t.titulo?.toLowerCase().includes(search.toLowerCase()) || t.estudiante?.nombre?.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) return <Box sx={{ p: 3 }}>Cargando...</Box>

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>Tickets</Typography>

      <TextField
        placeholder="Buscar tickets..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="small"
        sx={{ width: 300, mb: 2 }}
        InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Título</TableCell>
              <TableCell>Estudiante</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered?.map((ticket: any) => (
              <TableRow key={ticket.id} hover>
                <TableCell>#{ticket.id}</TableCell>
                <TableCell><Chip label={TIPO_LABELS[ticket.tipo] || ticket.tipo} size="small" variant="outlined" /></TableCell>
                <TableCell><Typography variant="body2" fontWeight={500} sx={{ maxWidth: 200 }} noWrap>{ticket.titulo}</Typography></TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>{ticket.estudiante?.nombre?.charAt(0)}</Avatar>
                    <Typography variant="body2">{ticket.estudiante?.nombre} {ticket.estudiante?.apellido}</Typography>
                  </Box>
                </TableCell>
                <TableCell><Chip label={ESTADO_LABELS[ticket.estado] || ticket.estado} size="small" color={ticket.estado === 'resuelto' ? 'success' : ticket.estado === 'cerrado' ? 'default' : 'warning'} /></TableCell>
                <TableCell><Typography variant="body2" color="text.secondary">{new Date(ticket.fecha_creacion).toLocaleDateString()}</Typography></TableCell>
                <TableCell>
                  <IconButton component={Link} to={`/tickets/${ticket.id}`} size="small"><Visibility /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
