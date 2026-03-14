'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { estudiantes, bootcamps } from '@/lib/api'
import { Estudiante, Bootcamp } from '@/types'
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  IconButton,
  Collapse,
  CircularProgress,
} from '@mui/material'
import {
  Add as AddIcon,
  KeyboardArrowDown as ArrowDownIcon,
  KeyboardArrowUp as ArrowUpIcon,
} from '@mui/icons-material'

export default function EstudiantesPage() {
  const searchParams = useSearchParams()
  const bootcampFilter = searchParams.get('bootcamp_id')
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    whatsapp: '',
    bootcamp_id: bootcampFilter ? parseInt(bootcampFilter) : '',
  })

  const { data: bootcampsList } = useQuery({
    queryKey: ['bootcamps'],
    queryFn: bootcamps.getAll,
  })

  const { data: estudiantesList, isLoading } = useQuery({
    queryKey: ['estudiantes', bootcampFilter],
    queryFn: () => estudiantes.getAll(bootcampFilter ? { bootcamp_id: parseInt(bootcampFilter) } : undefined),
  })

  const createMutation = useMutation({
    mutationFn: estudiantes.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estudiantes'] })
      setShowForm(false)
      setFormData({ nombre: '', apellido: '', email: '', telefono: '', whatsapp: '', bootcamp_id: '' })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({ ...formData, bootcamp_id: Number(formData.bootcamp_id) })
  }

  const getEstadoColor = (estado: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    const colors: Record<string, any> = {
      nuevo: 'primary',
      onboarding: 'secondary',
      activo: 'success',
      necesita_seguimiento: 'warning',
      en_riesgo: 'error',
      reactivado: 'warning',
      abandono: 'default',
      graduado: 'success',
    }
    return colors[estado] || 'default'
  }

  const getRiesgoColor = (riesgo: number) => {
    if (riesgo >= 60) return 'error'
    if (riesgo >= 30) return 'warning'
    return 'success'
  }

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
          Estudiantes
        </Typography>
        <Button
          variant="contained"
          startIcon={showForm ? <ArrowUpIcon /> : <AddIcon />}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancelar' : 'Nuevo Estudiante'}
        </Button>
      </Box>

      <Collapse in={showForm}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  fullWidth
                />
                <TextField
                  label="Apellido"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  required
                  fullWidth
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  fullWidth
                />
                <FormControl fullWidth>
                  <InputLabel>Bootcamp</InputLabel>
                  <Select
                    value={formData.bootcamp_id}
                    label="Bootcamp"
                    onChange={(e) => setFormData({ ...formData, bootcamp_id: e.target.value as any })}
                    required
                  >
                    <MenuItem value="">Seleccionar...</MenuItem>
                    {bootcampsList?.map((bc: Bootcamp) => (
                      <MenuItem key={bc.id} value={bc.id}>{bc.nombre}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Teléfono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  fullWidth
                />
                <TextField
                  label="WhatsApp"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  fullWidth
                />
              </Box>
              <Button
                type="submit"
                variant="contained"
                disabled={createMutation.isPending}
                sx={{ alignSelf: 'flex-start' }}
              >
                {createMutation.isPending ? 'Creando...' : 'Crear Estudiante'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Collapse>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Bootcamp</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Riesgo</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {estudiantesList?.map((estudiante: Estudiante) => (
              <TableRow key={estudiante.id} hover>
                <TableCell>
                  <Typography fontWeight="bold">
                    {estudiante.nombre} {estudiante.apellido}
                  </Typography>
                </TableCell>
                <TableCell>{estudiante.email}</TableCell>
                <TableCell>{estudiante.bootcamp_nombre || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={estudiante.estado.replace('_', ' ')}
                    size="small"
                    color={getEstadoColor(estudiante.estado)}
                  />
                </TableCell>
                <TableCell sx={{ minWidth: 150 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={estudiante.riesgo_desercion}
                      color={getRiesgoColor(estudiante.riesgo_desercion)}
                      sx={{ flexGrow: 1, height: 8, borderRadius: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 35 }}>
                      {estudiante.riesgo_desercion}%
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Button
                    component={Link}
                    href={`/dashboard/estudiantes/${estudiante.id}`}
                    size="small"
                  >
                    Ver perfil
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
