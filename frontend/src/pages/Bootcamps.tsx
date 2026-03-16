import { useQuery } from '@tanstack/react-query'
import { bootcamps } from '../lib/api'
import { Box, Typography, Grid, Card, CardContent, Chip } from '@mui/material'
import { School, People } from '@mui/icons-material'

export default function Bootcamps() {
  const { data: bootcampsList, isLoading } = useQuery({ queryKey: ['bootcamps'], queryFn: bootcamps.getAll })

  if (isLoading) return <Box sx={{ p: 3 }}>Cargando...</Box>

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>Bootcamps</Typography>
      
      <Grid container spacing={3}>
        {bootcampsList?.map((bc: any) => (
          <Grid item xs={12} md={6} lg={4} key={bc.id}>
            <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'primary.light', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <School sx={{ color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>{bc.nombre}</Typography>
                    <Chip label={bc.estado} size="small" color={bc.estado === 'activo' ? 'success' : 'default'} />
                  </Box>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center', p: 1.5, borderRadius: 2, bgcolor: 'grey.50' }}>
                      <People sx={{ color: 'text.secondary' }} />
                      <Typography variant="h6">{bc.total_estudiantes || 0}</Typography>
                      <Typography variant="caption" color="text.secondary">Total</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center', p: 1.5, borderRadius: 2, bgcolor: 'success.light', opacity: 0.1 }}>
                      <Typography variant="h6" color="success.main">{bc.estudiantes_activos || 0}</Typography>
                      <Typography variant="caption" color="text.secondary">Activos</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center', p: 1.5, borderRadius: 2, bgcolor: 'rgba(239, 68, 68, 0.1)' }}>
                      <Typography variant="h6" color="error.main">{bc.estudiantes_en_riesgo || 0}</Typography>
                      <Typography variant="caption" color="text.secondary">Riesgo</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
