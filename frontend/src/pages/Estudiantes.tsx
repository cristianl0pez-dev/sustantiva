import { useQuery } from '@tanstack/react-query'
import { estudiantes, bootcamps } from '../lib/api'
import { useTheme } from '@mui/material/styles'
import { Box, Typography, TextField, InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, LinearProgress, Avatar, Grid, Select, MenuItem, FormControl, InputLabel, Card, CardContent } from '@mui/material'
import { Search, FilterList, Email, Phone, Warning, School } from '@mui/icons-material'
import { useState } from 'react'

const getEstadoColor = (estado: string) => {
  const colors: Record<string, any> = { 
    nuevo: 'info', 
    onboarding: 'secondary', 
    activo: 'success', 
    necesita_seguimiento: 'warning', 
    en_riesgo: 'error', 
    reactivado: 'success',
    abandono: 'error',
    graduado: 'success'
  }
  return colors[estado] || 'default'
}

export default function Estudiantes() {
  const theme = useTheme()
  const [search, setSearch] = useState('')
  const [bootcampFilter, setBootcampFilter] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('')
  
  const { data: estudiantesList, isLoading } = useQuery({ 
    queryKey: ['estudiantes'], 
    queryFn: () => estudiantes.getAll() 
  })
  
  const { data: bootcampsList } = useQuery({ 
    queryKey: ['bootcamps'], 
    queryFn: bootcamps.getAll 
  })

  const filtered = estudiantesList?.filter((e: any) => {
    const matchSearch = `${e.nombre} ${e.apellido} ${e.email}`.toLowerCase().includes(search.toLowerCase())
    const matchBootcamp = !bootcampFilter || e.bootcamp_id === parseInt(bootcampFilter)
    const matchEstado = !estadoFilter || e.estado === estadoFilter
    return matchSearch && matchBootcamp && matchEstado
  })

  if (isLoading) return <Box sx={{ p: 3 }}><LinearProgress /></Box>

  const total = filtered?.length || 0
  const enRiesgo = filtered?.filter((e: any) => e.riesgo_desercion >= 60).length || 0
  const activos = filtered?.filter((e: any) => e.estado === 'activo').length || 0

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: 'text.primary' }}>Estudiantes</Typography>
          <Typography variant="body2" color="text.secondary">{total} estudiantes</Typography>
        </Box>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(30,41,59,0.5)' : 'white', border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="body2" color="text.secondary">Total</Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ color: 'primary.main' }}>{total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(30,41,59,0.5)' : 'white', border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="body2" color="text.secondary">Activos</Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ color: 'success.main' }}>{activos}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ borderRadius: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(30,41,59,0.5)' : 'white', border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="body2" color="text.secondary">En Riesgo</Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ color: 'error.main' }}>{enRiesgo}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Buscar por nombre, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ minWidth: 280 }}
          InputProps={{ 
            startAdornment: <InputAdornment position="start"><Search sx={{ color: 'text.secondary' }} /></InputAdornment>,
            sx: { borderRadius: 2 }
          }}
        />
        
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Bootcamp</InputLabel>
          <Select
            value={bootcampFilter}
            label="Bootcamp"
            onChange={(e) => setBootcampFilter(e.target.value)}
          >
            <MenuItem value="">Todos</MenuItem>
            {bootcampsList?.map((bc: any) => (
              <MenuItem key={bc.id} value={bc.id}>{bc.codigo}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Estado</InputLabel>
          <Select
            value={estadoFilter}
            label="Estado"
            onChange={(e) => setEstadoFilter(e.target.value)}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="nuevo">Nuevo</MenuItem>
            <MenuItem value="onboarding">Onboarding</MenuItem>
            <MenuItem value="activo">Activo</MenuItem>
            <MenuItem value="necesita_seguimiento">Necesita Seguimiento</MenuItem>
            <MenuItem value="en_riesgo">En Riesgo</MenuItem>
            <MenuItem value="reactivado">Reactivado</MenuItem>
            <MenuItem value="graduado">Graduado</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: theme.palette.mode === 'dark' ? 'rgba(30,41,59,0.5)' : 'white' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'grey.50' }}>
              <TableCell sx={{ fontWeight: 600 }}>Estudiante</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Contacto</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Bootcamp</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Último Acceso Moodle</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Riesgo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered?.map((est: any) => (
              <TableRow key={est.id} hover sx={{ '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'grey.50' } }}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14 }}>
                      {est.nombre.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography fontWeight="600" sx={{ color: 'text.primary' }}>{est.nombre} {est.apellido}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{est.email}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {est.telefono && <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Phone sx={{ fontSize: 14, color: 'text.secondary' }} /><Typography variant="caption">{est.telefono}</Typography></Box>}
                    {est.whatsapp && <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Email sx={{ fontSize: 14, color: 'text.secondary' }} /><Typography variant="caption">{est.whatsapp}</Typography></Box>}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    icon={<School sx={{ fontSize: 14 }} />} 
                    label={est.bootcamp_nombre?.substring(0, 15) || '-'} 
                    size="small" 
                    variant="outlined"
                    sx={{ borderRadius: 1 }}
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={est.estado?.replace('_', ' ')} 
                    size="small" 
                    color={getEstadoColor(est.estado)}
                    sx={{ fontWeight: 600, borderRadius: 1 }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {est.ultimo_acceso_moodle ? new Date(est.ultimo_acceso_moodle).toLocaleDateString('es-ES') : '-'}
                  </Typography>
                </TableCell>
                <TableCell sx={{ minWidth: 140 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={est.riesgo_desercion} 
                      color={est.riesgo_desercion >= 60 ? 'error' : est.riesgo_desercion >= 30 ? 'warning' : 'success'} 
                      sx={{ flexGrow: 1, height: 8, borderRadius: 1 }} 
                    />
                    <Typography variant="body2" fontWeight="600" sx={{ minWidth: 30, color: est.riesgo_desercion >= 60 ? 'error.main' : est.riesgo_desercion >= 30 ? 'warning.main' : 'success.main' }}>
                      {est.riesgo_desercion}%
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
