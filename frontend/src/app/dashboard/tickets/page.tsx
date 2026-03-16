'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tickets, estudiantes } from '@/lib/api'
import Link from 'next/link'
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  CircularProgress,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Collapse,
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

export default function TicketsPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtros, setFiltros] = useState({
    estado: '',
    tipo: '',
    prioridad: '',
    nivel: '',
  })
  const [formData, setFormData] = useState({
    estudiante_id: '',
    tipo: '',
    titulo: '',
    descripcion: '',
    prioridad: 'media',
  })

  const { data: ticketsList, isLoading } = useQuery({
    queryKey: ['tickets', filtros],
    queryFn: () => tickets.getAll(
      filtros.estado || filtros.tipo || filtros.prioridad || filtros.nivel 
        ? { 
            estado: filtros.estado || undefined,
            tipo: filtros.tipo || undefined,
            prioridad: filtros.prioridad || undefined,
            nivel: filtros.nivel || undefined,
          } 
        : undefined
    ),
  })

  const { data: opciones } = useQuery({
    queryKey: ['tickets-opciones'],
    queryFn: tickets.getOpciones,
  })

  const { data: estudiantesList } = useQuery({
    queryKey: ['estudiantes'],
    queryFn: () => estudiantes.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: tickets.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      setShowForm(false)
      setFormData({ estudiante_id: '', tipo: '', titulo: '', descripcion: '', prioridad: 'media' })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      ...formData,
      estudiante_id: Number(formData.estudiante_id),
    })
  }

  const filteredTickets = ticketsList?.filter((ticket: any) =>
    ticket.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.estudiante?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.estudiante?.apellido?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Tickets
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancelar' : 'Nuevo Ticket'}
        </Button>
      </Box>

      <Collapse in={showForm}>
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Estudiante</InputLabel>
                    <Select
                      value={formData.estudiante_id}
                      label="Estudiante"
                      onChange={(e) => setFormData({ ...formData, estudiante_id: e.target.value })}
                      required
                    >
                      <MenuItem value="">Seleccionar...</MenuItem>
                      {estudiantesList?.map((est: any) => (
                        <MenuItem key={est.id} value={est.id}>
                          {est.nombre} {est.apellido}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo de Ticket</InputLabel>
                    <Select
                      value={formData.tipo}
                      label="Tipo de Ticket"
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                      required
                    >
                      <MenuItem value="">Seleccionar...</MenuItem>
                      {opciones?.tipos?.map((tipo: string) => (
                        <MenuItem key={tipo} value={tipo}>
                          {TIPO_LABELS[tipo] || tipo}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Título"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Descripción"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    required
                    fullWidth
                    multiline
                    rows={3}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Prioridad</InputLabel>
                    <Select
                      value={formData.prioridad}
                      label="Prioridad"
                      onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
                    >
                      {opciones?.prioridades?.map((p: string) => (
                        <MenuItem key={p} value={p}>{p}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? 'Creando...' : 'Crear Ticket'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Collapse>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <TextField
            placeholder="Buscar tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={6} md={2}>
          <FormControl size="small" fullWidth>
            <InputLabel>Estado</InputLabel>
            <Select
              value={filtros.estado}
              label="Estado"
              onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
            >
              <MenuItem value="">Todos</MenuItem>
              {opciones?.estados?.map((e: string) => (
                <MenuItem key={e} value={e}>{ESTADO_LABELS[e] || e}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} md={2}>
          <FormControl size="small" fullWidth>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={filtros.tipo}
              label="Tipo"
              onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
            >
              <MenuItem value="">Todos</MenuItem>
              {opciones?.tipos?.map((t: string) => (
                <MenuItem key={t} value={t}>{TIPO_LABELS[t] || t}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} md={2}>
          <FormControl size="small" fullWidth>
            <InputLabel>Prioridad</InputLabel>
            <Select
              value={filtros.prioridad}
              label="Prioridad"
              onChange={(e) => setFiltros({ ...filtros, prioridad: e.target.value })}
            >
              <MenuItem value="">Todas</MenuItem>
              {opciones?.prioridades?.map((p: string) => (
                <MenuItem key={p} value={p}>{p}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6} md={2}>
          <FormControl size="small" fullWidth>
            <InputLabel>Nivel</InputLabel>
            <Select
              value={filtros.nivel}
              label="Nivel"
              onChange={(e) => setFiltros({ ...filtros, nivel: e.target.value })}
            >
              <MenuItem value="">Todos</MenuItem>
              {opciones?.niveles?.map((n: string) => (
                <MenuItem key={n} value={n}>{NIVEL_LABELS[n] || n}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Título</TableCell>
              <TableCell>Estudiante</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Prioridad</TableCell>
              <TableCell>Nivel</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTickets?.map((ticket: any) => (
              <TableRow key={ticket.id} hover>
                <TableCell>#{ticket.id}</TableCell>
                <TableCell>
                  <Chip
                    label={TIPO_LABELS[ticket.tipo] || ticket.tipo}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={500} sx={{ maxWidth: 200 }} noWrap>
                    {ticket.titulo}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                      {ticket.estudiante?.nombre?.charAt(0)}
                    </Avatar>
                    <Typography variant="body2">
                      {ticket.estudiante?.nombre} {ticket.estudiante?.apellido}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={ESTADO_LABELS[ticket.estado] || ticket.estado}
                    size="small"
                    color={ticket.estado === 'resuelto' ? 'success' : ticket.estado === 'cerrado' ? 'default' : 'warning'}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={ticket.prioridad}
                    size="small"
                    color={PRIORIDAD_COLORS[ticket.prioridad]}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {NIVEL_LABELS[ticket.nivel] || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(ticket.fecha_creacion).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Tooltip title="Ver detalle">
                    <IconButton
                      component={Link}
                      href={`/dashboard/tickets/${ticket.id}`}
                      size="small"
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredTickets?.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography color="text.secondary">
            No se encontraron tickets
          </Typography>
        </Box>
      )}
    </Box>
  )
}
