import { useQuery } from '@tanstack/react-query'
import { estudiantes } from '../lib/api'
import { Box, Typography, TextField, InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, LinearProgress, Avatar } from '@mui/material'
import { Search } from '@mui/icons-material'
import { useState } from 'react'

const getEstadoColor = (estado: string) => {
  const colors: Record<string, any> = { nuevo: 'primary', onboarding: 'secondary', activo: 'success', necesita_seguimiento: 'warning', en_riesgo: 'error', graduado: 'success' }
  return colors[estado] || 'default'
}

export default function Estudiantes() {
  const [search, setSearch] = useState('')
  const { data: estudiantesList, isLoading } = useQuery({ queryKey: ['estudiantes'], queryFn: () => estudiantes.getAll() })

  const filtered = estudiantesList?.filter((e: any) =>
    `${e.nombre} ${e.apellido} ${e.email}`.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) return <Box sx={{ p: 3 }}>Cargando...</Box>

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Estudiantes</Typography>
      </Box>

      <TextField
        placeholder="Buscar estudiantes..."
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
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Bootcamp</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Riesgo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered?.map((est: any) => (
              <TableRow key={est.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32 }}>{est.nombre.charAt(0)}</Avatar>
                    <Typography fontWeight="bold">{est.nombre} {est.apellido}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{est.email}</TableCell>
                <TableCell>{est.bootcamp_nombre || '-'}</TableCell>
                <TableCell>
                  <Chip label={est.estado.replace('_', ' ')} size="small" color={getEstadoColor(est.estado)} />
                </TableCell>
                <TableCell sx={{ minWidth: 150 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress variant="determinate" value={est.riesgo_desercion} color={est.riesgo_desercion >= 60 ? 'error' : est.riesgo_desercion >= 30 ? 'warning' : 'success'} sx={{ flexGrow: 1, height: 8, borderRadius: 1 }} />
                    <Typography variant="body2" color="text.secondary">{est.riesgo_desercion}%</Typography>
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
