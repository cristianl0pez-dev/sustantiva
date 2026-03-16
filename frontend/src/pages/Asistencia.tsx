import { useState, useMemo } from 'react'
import { Box, Typography, Grid, Card, CardContent, TextField, Button, List, ListItem, ListItemText, ListItemSecondaryAction, Checkbox, Chip, Divider, Snackbar, Alert } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { Description, CheckCircle, PersonAdd } from '@mui/icons-material'

interface EstudianteAsistencia {
  nombre: string
  presente: boolean
}

const limpiarNombre = (linea: string) => {
  return linea
    .replace(/^[0-9]+\.?\s*/, '')
    .replace(/Ordenados.*$/i, '')
    .replace(/Lista de usuarios.*$/i, '')
    .trim()
}

const esLineaNombre = (linea: string) => {
  if (!linea) return false
  const lower = linea.toLowerCase()
  if (lower.startsWith('lista de usuarios') || lower.startsWith('ordenados por')) return false
  if (linea.includes(':') || linea.endsWith(':')) return false
  if (linea.match(/^[0-9]+$/)) return false
  return linea.trim().length > 2
}

export default function Asistencia() {
  const theme = useTheme()
  const [rawText, setRawText] = useState('')
  const [estudiantes, setEstudiantes] = useState<EstudianteAsistencia[]>([])
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })

  const presentes = useMemo(() => estudiantes.filter((e) => e.presente).length, [estudiantes])

  const handleParse = () => {
    const lineas = rawText.split('\n').map((l) => limpiarNombre(l))
    const nombres = Array.from(new Set(lineas.filter(esLineaNombre)))
    if (!nombres.length) {
      setSnackbar({ open: true, message: 'No se encontraron nombres en el texto', severity: 'error' })
      return
    }
    setEstudiantes(nombres.map((n) => ({ nombre: n, presente: true })))
    setSnackbar({ open: true, message: `Se cargaron ${nombres.length} estudiantes`, severity: 'success' })
  }

  const handleToggle = (index: number) => {
    setEstudiantes((prev) => prev.map((est, i) => (i === index ? { ...est, presente: !est.presente } : est)))
  }

  const handleAdd = () => {
    if (!nuevoNombre.trim()) return
    setEstudiantes((prev) => [{ nombre: nuevoNombre.trim(), presente: true }, ...prev])
    setNuevoNombre('')
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>Tomar Asistencia</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: theme.palette.mode === 'dark' ? 'rgba(30,41,59,0.5)' : 'white' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Description sx={{ color: 'primary.main' }} />
                <Typography variant="h6" fontWeight="bold">Pegar lista desde texto</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Puedes pegar la lista completa exportada desde la sala virtual. Detectaremos y limpiaremos los nombres automáticamente.
              </Typography>
              <TextField
                multiline
                minRows={6}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Pega aquí el texto de asistencia..."
                fullWidth
                sx={{ mb: 2 }}
              />
              <Button variant="contained" onClick={handleParse} disabled={!rawText.trim()}>
                Detectar nombres
              </Button>
              <Divider sx={{ my: 3 }} />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  label="Agregar manualmente"
                  size="small"
                  fullWidth
                />
                <Button variant="outlined" startIcon={<PersonAdd />} onClick={handleAdd} disabled={!nuevoNombre.trim()}>
                  Agregar
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: theme.palette.mode === 'dark' ? 'rgba(30,41,59,0.5)' : 'white', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CheckCircle sx={{ color: 'success.main' }} />
                <Typography variant="h6" fontWeight="bold">Lista del día</Typography>
                <Chip label={`${presentes}/${estudiantes.length} presentes`} color={presentes === estudiantes.length ? 'success' : 'warning'} sx={{ ml: 'auto' }} />
              </Box>
              <List dense>
                {estudiantes.map((est, index) => (
                  <ListItem
                    key={est.nombre + index}
                    sx={{ borderBottom: '1px solid', borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'grey.100' }}
                    secondaryAction={
                      <Checkbox edge="end" checked={est.presente} onChange={() => handleToggle(index)} color={est.presente ? 'success' : 'default'} />
                    }
                  >
                    <ListItemText
                      primary={est.nombre}
                      primaryTypographyProps={{ fontWeight: 600, color: est.presente ? 'text.primary' : 'text.secondary' }}
                      secondary={est.presente ? 'Presente' : 'Ausente'}
                      secondaryTypographyProps={{ color: est.presente ? 'success.main' : 'error.main' }}
                    />
                  </ListItem>
                ))}
              </List>
              {!estudiantes.length && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Todavía no hay estudiantes cargados. Pega un texto o agrega manualmente.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
