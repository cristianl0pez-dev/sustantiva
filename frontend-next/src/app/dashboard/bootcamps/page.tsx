'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bootcamps } from '@/lib/api'
import { Bootcamp } from '@/types'
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
  Collapse,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material'
import {
  Add as AddIcon,
  KeyboardArrowUp as ArrowUpIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Search as SearchIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  TrendingUp as ActiveIcon,
  Warning as WarningIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material'

export default function BootcampsPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    estado: 'activo',
  })

  const { data: bootcampsList, isLoading } = useQuery({
    queryKey: ['bootcamps'],
    queryFn: bootcamps.getAll,
  })

  const createMutation = useMutation({
    mutationFn: bootcamps.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bootcamps'] })
      setShowForm(false)
      setFormData({ nombre: '', descripcion: '', estado: 'activo' })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  const getEstadoColor = (estado: string) => {
    const colors: Record<string, any> = {
      activo: 'success',
      finalizado: 'default',
      planificado: 'info',
    }
    return colors[estado] || 'default'
  }

  const getEstadoLabel = (estado: string) => {
    const labels: Record<string, string> = {
      activo: 'Activo',
      finalizado: 'Finalizado',
      planificado: 'Planificado',
    }
    return labels[estado] || estado
  }

  const filteredBootcamps = bootcampsList?.filter((bc: Bootcamp) =>
    bc.nombre.toLowerCase().includes(searchTerm.toLowerCase())
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
          Bootcamps
        </Typography>
        <Button
          variant="contained"
          startIcon={showForm ? <ArrowUpIcon /> : <AddIcon />}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancelar' : 'Nuevo Bootcamp'}
        </Button>
      </Box>

      <Collapse in={showForm}>
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    label="Estado"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    fullWidth
                    SelectProps={{ native: true }}
                  >
                    <option value="planificado">Planificado</option>
                    <option value="activo">Activo</option>
                    <option value="finalizado">Finalizado</option>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Descripción"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    fullWidth
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={createMutation.isPending}
                    sx={{ mr: 1 }}
                  >
                    {createMutation.isPending ? 'Creando...' : 'Crear Bootcamp'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Collapse>

      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Buscar bootcamps..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Grid container spacing={3}>
        {filteredBootcamps?.map((bootcamp: Bootcamp) => (
          <Grid item xs={12} md={6} lg={4} key={bootcamp.id}>
            <Card 
              sx={{ 
                height: '100%', 
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: 'primary.light',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <SchoolIcon sx={{ color: 'white' }} />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {bootcamp.nombre}
                      </Typography>
                      <Chip 
                        label={getEstadoLabel(bootcamp.estado)} 
                        size="small" 
                        color={getEstadoColor(bootcamp.estado)}
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Box>
                </Box>

                {bootcamp.descripcion && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {bootcamp.descripcion}
                  </Typography>
                )}

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center', p: 1.5, borderRadius: 2, bgcolor: 'grey.50' }}>
                      <PeopleIcon sx={{ color: 'text.secondary', fontSize: 20, mb: 0.5 }} />
                      <Typography variant="h6" fontWeight={700}>
                        {bootcamp.total_estudiantes || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Total
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center', p: 1.5, borderRadius: 2, bgcolor: 'success.light', bgcolor: 'rgba(16, 185, 129, 0.1)' }}>
                      <ActiveIcon sx={{ color: 'success.main', fontSize: 20, mb: 0.5 }} />
                      <Typography variant="h6" fontWeight={700} color="success.main">
                        {bootcamp.estudiantes_activos || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Activos
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center', p: 1.5, borderRadius: 2, bgcolor: 'rgba(239, 68, 68, 0.1)' }}>
                      <WarningIcon sx={{ color: 'error.main', fontSize: 20, mb: 0.5 }} />
                      <Typography variant="h6" fontWeight={700} color="error.main">
                        {bootcamp.estudiantes_en_riesgo || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Riesgo
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Button
                  component={Link}
                  href={`/dashboard/bootcamps/${bootcamp.id}`}
                  fullWidth
                  endIcon={<ArrowForwardIcon />}
                  sx={{ 
                    mt: 1,
                    justifyContent: 'space-between',
                    '& .MuiButton-endIcon': { mr: -1 },
                  }}
                >
                  Ver Kanban
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredBootcamps?.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <SchoolIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography color="text.secondary">
            No se encontraron bootcamps
          </Typography>
        </Box>
      )}
    </Box>
  )
}
