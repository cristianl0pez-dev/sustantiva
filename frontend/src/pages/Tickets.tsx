import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { tickets } from '../lib/api'
import { useTheme } from '@mui/material/styles'
import { Box, Typography, TextField, InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Avatar, IconButton, Grid, Card, CardContent, Select, MenuItem, FormControl, InputLabel } from '@mui/material'
import { Search, Visibility, Add, ConfirmationNumber, AccessTime, CheckCircle, Schedule } from '@mui/icons-material'
import { useState } from 'react'

const TIPO_LABELS: Record<string, string> = { 
  acceso: 'Acceso', 
  enlace_clase: 'Enlace Clase', 
  tecnico: 'Técnico', 
  materiales: 'Materiales', 
  asistencia: 'Asistencia', 
  evaluacion: 'Evaluación', 
  tarea_feedback: 'Tarea', 
  administrativo: 'Admin', 
  certificacion: 'Certificación', 
  subsidio: 'Subsidio', 
  otro: 'Otro' 
}

const ESTADO_COLORS: Record<string, any> = { 
  abierto: 'error', 
  en_proceso: 'warning', 
  resuelto: 'success', 
  cerrado: 'default' 
}

export default function Tickets() {
  const theme = useTheme()
  const [search, setSearch] = useState('')
  const [tipoFilter, setTipoFilter] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('')
  
  const { data: ticketsList, isLoading } = useQuery({ queryKey: ['tickets'], queryFn: () => tickets.getAll() })

  const filtered = ticketsList?.filter((t: any) => {
    const matchSearch = `${t.titulo} ${t.estudiante?.nombre} ${t.estudiante?.apellido}`.toLowerCase().includes(search.toLowerCase())
    const matchTipo = !tipoFilter || t.tipo === tipoFilter
    const matchEstado = !estadoFilter || t.estado === estadoFilter
    return matchSearch && matchTipo && matchEstado
  })

  if (isLoading) return <Box sx={{ p: 3 }}><Typography>Cargando...</Typography></Box>

  const total = filtered?.length || 0
  const abiertos = filtered?.filter((t: any) => t.estado === 'abierto').length || 0
  const enProceso = filtered?.filter((t: any) => t.estado === 'en_proceso').length || 0
  const resueltos = filtered?.filter((t: any) => t.estado === 'resuelto').length || 0

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: 'text.primary' }}>Tickets</Typography>
          <Typography variant="body2" color="text.secondary">{total} tickets</Typography>
        </Box>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: theme.palette.mode === 'dark' ? 'rgba(30,41,59,0.5)' : 'white' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ConfirmationNumber sx={{ color: 'error.main' }} />
                <Box>
                  <Typography variant="h5" fontWeight="bold">{abiertos}</Typography>
                  <Typography variant="caption" color="text.secondary">Abiertos</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: theme.palette.mode === 'dark' ? 'rgba(30,41,59,0.5)' : 'white' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule sx={{ color: 'warning.main' }} />
                <Box>
                  <Typography variant="h5" fontWeight="bold">{enProceso}</Typography>
                  <Typography variant="caption" color="text.secondary">En Proceso</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: theme.palette.mode === 'dark' ? 'rgba(30,41,59,0.5)' : 'white' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle sx={{ color: 'success.main' }} />
                <Box>
                  <Typography variant="h5" fontWeight="bold">{resueltos}</Typography>
                  <Typography variant="caption" color="text.secondary">Resueltos</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: theme.palette.mode === 'dark' ? 'rgba(30,41,59,0.5)' : 'white' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTime sx={{ color: 'text.secondary' }} />
                <Box>
                  <Typography variant="h5" fontWeight="bold">{total}</Typography>
                  <Typography variant="caption" color="text.secondary">Total</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Buscar ticket, estudiante..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 280 }}
          InputProps={{ 
            startAdornment: <InputAdornment position="start"><Search sx={{ color: 'text.secondary' }} /></InputAdornment>,
            sx: { borderRadius: 2 }
          }}
        />
        
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Tipo</InputLabel>
          <Select value={tipoFilter} label="Tipo" onChange={(e) => setTipoFilter(e.target.value)}>
            <MenuItem value="">Todos</MenuItem>
            {Object.entries(TIPO_LABELS).map(([key, label]) => (
              <MenuItem key={key} value={key}>{label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Estado</InputLabel>
          <Select value={estadoFilter} label="Estado" onChange={(e) => setEstadoFilter(e.target.value)}>
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="abierto">Abierto</MenuItem>
            <MenuItem value="en_proceso">En Proceso</MenuItem>
            <MenuItem value="resuelto">Resuelto</MenuItem>
            <MenuItem value="cerrado">Cerrado</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: theme.palette.mode === 'dark' ? 'rgba(30,41,59,0.5)' : 'white' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'grey.50' }}>
              <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Título</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Estudiante</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Creación</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered?.map((ticket: any) => (
              <TableRow key={ticket.id} hover sx={{ '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'grey.50' } }}>
                <TableCell>
                  <Typography fontWeight="600" color="primary">#{ticket.id}</Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={TIPO_LABELS[ticket.tipo] || ticket.tipo} 
                    size="small" 
                    variant="outlined"
                    sx={{ borderRadius: 1 }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={500} sx={{ maxWidth: 250 }} noWrap>
                    {ticket.titulo}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: 'primary.main' }}>
                      {ticket.estudiante?.nombre?.charAt(0)}
                    </Avatar>
                    <Typography variant="body2">
                      {ticket.estudiante?.nombre} {ticket.estudiante?.apellido}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={ESTADO_COLORS[ticket.estado] === 'default' ? 'Cerrado' : ticket.estado.replace('_', ' ')} 
                    size="small" 
                    color={ESTADO_COLORS[ticket.estado]}
                    sx={{ fontWeight: 600, borderRadius: 1 }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {new Date(ticket.fecha_creacion).toLocaleDateString('es-ES')}
                  </Typography>
                </TableCell>
                <TableCell>
                  <IconButton 
                    component={Link} 
                    to={`/tickets/${ticket.id}`} 
                    size="small"
                    sx={{ color: 'primary.main' }}
                  >
                    <Visibility />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
