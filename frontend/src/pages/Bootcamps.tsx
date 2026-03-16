import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bootcamps } from '../lib/api'
import { useTheme } from '@mui/material/styles'
import { 
  Box, Typography, Grid, Card, CardContent, Chip, Avatar, 
  LinearProgress, IconButton, Button, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, MenuItem, InputAdornment,
  Alert, Snackbar, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Menu
} from '@mui/material'
import { 
  School, People, Add, TrendingUp, Warning, 
  CalendarToday, AccessTime, MoreVert, Group, Search, 
  Upload, FileUpload, CheckCircle, Error as ErrorIcon, Delete
} from '@mui/icons-material'

interface Bootcamp {
  id: number
  codigo: string
  nombre: string
  descripcion?: string
  estado: string
  fecha_inicio?: string
  fecha_fin?: string
  total_estudiantes: number
  estudiantes_activos: number
  estudiantes_en_riesgo: number
}

export default function Bootcamps() {
  const theme = useTheme()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [openModal, setOpenModal] = useState(false)
  const [openManualModal, setOpenManualModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<any>(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })
  
  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ open: false, bootcamp: null as Bootcamp | null })
  const [menuAnchor, setMenuAnchor] = useState<{el: HTMLElement | null, bootcamp: Bootcamp | null}>({ el: null, bootcamp: null })
  
  // Manual form state
  const [manualForm, setManualForm] = useState({ codigo: '', nombre: '', descripcion: '' })

  const { data: bootcampsList, isLoading } = useQuery<Bootcamp[]>({ 
    queryKey: ['bootcamps'], 
    queryFn: bootcamps.getAll 
  })

  const importMutation = useMutation({
    mutationFn: bootcamps.importExcel,
    onSuccess: (data) => {
      setImportResult(data)
      queryClient.invalidateQueries({ queryKey: ['bootcamps'] })
      setSnackbar({ open: true, message: data.message, severity: 'success' })
    },
    onError: (error: any) => {
      setSnackbar({ open: true, message: error.response?.data?.detail || 'Error al importar', severity: 'error' })
    }
  })

  const createMutation = useMutation({
    mutationFn: bootcamps.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bootcamps'] })
      setSnackbar({ open: true, message: 'Bootcamp creado exitosamente', severity: 'success' })
      setOpenManualModal(false)
      setManualForm({ codigo: '', nombre: '', descripcion: '' })
    },
    onError: (error: any) => {
      setSnackbar({ open: true, message: error.response?.data?.detail || 'Error al crear bootcamp', severity: 'error' })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: bootcamps.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bootcamps'] })
      setSnackbar({ open: true, message: 'Bootcamp eliminado', severity: 'success' })
      setDeleteModal({ open: false, bootcamp: null })
    },
    onError: (error: any) => {
      setSnackbar({ open: true, message: error.response?.data?.detail || 'Error al eliminar bootcamp', severity: 'error' })
    }
  })

  const handleImport = () => {
    if (!selectedFile) return
    setImporting(true)
    importMutation.mutate(selectedFile)
  }

  const filteredBootcamps = bootcampsList?.filter(bc => 
    bc.nombre.toLowerCase().includes(search.toLowerCase()) ||
    bc.codigo.toLowerCase().includes(search.toLowerCase())
  ) || []

  if (isLoading) {
    return (
      <Box sx={{ p: 4 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Cargando bootcamps...</Typography>
      </Box>
    )
  }

  const totalStudents = bootcampsList?.reduce((acc, bc) => acc + bc.total_estudiantes, 0) || 0
  const totalAtRisk = bootcampsList?.reduce((acc, bc) => acc + bc.estudiantes_en_riesgo, 0) || 0

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: 'text.primary' }}>
            Bootcamps
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Gestión de programas de formación
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Buscar bootcamp..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ 
              minWidth: 250,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
          <Button 
            variant="outlined" 
            startIcon={<Add />}
            onClick={() => setOpenManualModal(true)}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              py: 1.5,
              fontWeight: 600,
            }}
          >
            Nuevo Bootcamp
          </Button>
          <Button 
            variant="contained" 
            startIcon={<FileUpload />}
            onClick={() => setOpenModal(true)}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              py: 1.5,
              fontWeight: 600,
              boxShadow: '0 4px 14px rgba(96, 165, 250, 0.25)'
            }}
          >
            Importar Excel
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ 
            borderRadius: 3, 
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: 'white',
            border: 'none',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h2" fontWeight="bold">
                    {bootcampsList?.length || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Bootcamps
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <School />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ 
            borderRadius: 3, 
            border: '1px solid',
            borderColor: 'divider',
            background: theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'white',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h2" fontWeight="bold" sx={{ color: 'primary.main' }}>
                    {totalStudents}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Estudiantes
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.light', width: 56, height: 56 }}>
                  <Group />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ 
            borderRadius: 3, 
            border: '1px solid',
            borderColor: 'divider',
            background: theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'white',
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h2" fontWeight="bold" sx={{ color: 'warning.main' }}>
                    {totalAtRisk}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    En Riesgo
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.light', width: 56, height: 56 }}>
                  <Warning />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bootcamp Cards */}
      <Typography variant="h6" fontWeight="600" sx={{ mb: 2, color: 'text.secondary' }}>
        Programas {search ? `(${filteredBootcamps.length})` : 'Activos'}
      </Typography>
      
      <Grid container spacing={3}>
        {filteredBootcamps.map((bc) => (
          <Grid item xs={12} md={6} lg={4} key={bc.id}>
            <Link to={`/estudiantes?bootcamp=${bc.id}`} style={{ textDecoration: 'none' }}>
              <Card sx={{ 
                height: '100%', 
                borderRadius: 3, 
                transition: 'all 0.3s ease',
                border: '1px solid',
                borderColor: 'divider',
                background: theme.palette.mode === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'white',
                cursor: 'pointer',
                '&:hover': { 
                  transform: 'translateY(-8px)',
                  boxShadow: theme.palette.mode === 'dark' 
                    ? '0 12px 40px rgba(0,0,0,0.4)' 
                    : '0 12px 40px rgba(0,0,0,0.12)',
                  borderColor: 'primary.main'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Avatar 
                      sx={{ 
                        width: 56, 
                        height: 56, 
                        bgcolor: 'primary.main',
                        fontSize: '1.5rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {bc.codigo.substring(0, 2)}
                    </Avatar>
                    <Box>
                      <Chip 
                        label={bc.estado === 'activo' ? 'Activo' : bc.estado} 
                        size="small" 
                        color={bc.estado === 'activo' ? 'success' : 'default'}
                        sx={{ fontWeight: 600, mb: 0.5 }}
                      />
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {bc.codigo}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton 
                    size="small" 
                    sx={{ color: 'text.secondary' }}
                    onClick={(e) => setMenuAnchor({ el: e.currentTarget, bootcamp: bc })}
                  >
                    <MoreVert />
                  </IconButton>
                </Box>

                <Typography variant="h6" fontWeight="600" sx={{ mb: 1, lineHeight: 1.3, color: 'text.primary' }}>
                  {bc.nombre}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Progreso
                    </Typography>
                    <Typography variant="caption" fontWeight="600" sx={{ color: 'primary.main' }}>
                      {bc.total_estudiantes > 0 
                        ? Math.round((bc.estudiantes_activos / bc.total_estudiantes) * 100) 
                        : 0}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={bc.total_estudiantes > 0 
                      ? (bc.estudiantes_activos / bc.total_estudiantes) * 100 
                      : 0} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'grey.100',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)'
                      }
                    }}
                  />
                </Box>

                <Grid container spacing={1.5}>
                  <Grid item xs={4}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 1.5, 
                      borderRadius: 2, 
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'grey.50'
                    }}>
                      <People sx={{ color: 'text.secondary', mb: 0.5 }} />
                      <Typography variant="h6" fontWeight="bold" sx={{ color: 'text.primary' }}>
                        {bc.total_estudiantes}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Total
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 1.5, 
                      borderRadius: 2, 
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(52, 211, 153, 0.1)' : 'success.light',
                      opacity: theme.palette.mode === 'dark' ? 1 : 0.8
                    }}>
                      <TrendingUp sx={{ color: 'success.main', mb: 0.5 }} />
                      <Typography variant="h6" fontWeight="bold" sx={{ color: 'success.main' }}>
                        {bc.estudiantes_activos}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Activos
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      p: 1.5, 
                      borderRadius: 2, 
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(248, 113, 113, 0.1)' : 'error.light',
                      opacity: theme.palette.mode === 'dark' ? 1 : 0.8
                    }}>
                      <Warning sx={{ color: 'error.main', mb: 0.5 }} />
                      <Typography variant="h6" fontWeight="bold" sx={{ color: 'error.main' }}>
                        {bc.estudiantes_en_riesgo}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Riesgo
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            </Link>
          </Grid>
        ))}
      </Grid>

      {filteredBootcamps.length === 0 && search && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Search sx={{ fontSize: 80, color: 'grey.600', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No se encontraron bootcamps
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Prueba con otro término de búsqueda
          </Typography>
        </Box>
      )}

      {(!bootcampsList || bootcampsList.length === 0) && !search && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <School sx={{ fontSize: 80, color: 'grey.600', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No hay bootcamps registrados
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Importa un Excel para crear un bootcamp
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<FileUpload />}
            onClick={() => setOpenModal(true)}
          >
            Importar Excel
          </Button>
        </Box>
      )}

      {/* Modal Importar Excel */}
      <Dialog open={openModal} onClose={() => { setOpenModal(false); setImportResult(null); setSelectedFile(null); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FileUpload /> Importar Bootcamp desde Excel
        </DialogTitle>
        <DialogContent>
          {!importResult ? (
            <Box sx={{ py: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Sube un archivo Excel con los datos de los estudiantes. 
                El código del bootcamp se detectará automáticamente de la columna "RTD-..." 
                o similar.
              </Typography>
              
              <Box 
                sx={{ 
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { borderColor: 'primary.main' }
                }}
                onClick={() => document.getElementById('excel-input')?.click()}
              >
                <input 
                  id="excel-input"
                  type="file" 
                  accept=".xlsx,.xls" 
                  hidden
                  onChange={(e) => setSelectedFile((e.target.files?.[0] || null))}
                />
                {selectedFile ? (
                  <Box>
                    <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                    <Typography variant="body1" fontWeight="600">
                      {selectedFile.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <Upload sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body1" fontWeight="600">
                      Haz clic para seleccionar archivo
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Formatos: .xlsx, .xls
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          ) : (
            <Box sx={{ py: 2 }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                {importResult.message}
              </Alert>
              {importResult.bootcamp && (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Código</TableCell>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Estudiantes</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>{importResult.bootcamp.codigo}</TableCell>
                        <TableCell>{importResult.bootcamp.nombre}</TableCell>
                        <TableCell>{importResult.estudiantes_creados}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenModal(false); setImportResult(null); setSelectedFile(null); }}>
            {importResult ? 'Cerrar' : 'Cancelar'}
          </Button>
          {!importResult && (
            <Button 
              variant="contained" 
              onClick={handleImport}
              disabled={!selectedFile || importing}
            >
              {importing ? 'Importando...' : 'Importar'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Modal Nuevo Bootcamp Manual */}
      <Dialog open={openManualModal} onClose={() => setOpenManualModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Add /> Nuevo Bootcamp
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Código"
              value={manualForm.codigo}
              onChange={(e) => setManualForm({ ...manualForm, codigo: e.target.value })}
              fullWidth
              required
              placeholder="RTD-24-01-06-0023-4"
            />
            <TextField
              label="Nombre"
              value={manualForm.nombre}
              onChange={(e) => setManualForm({ ...manualForm, nombre: e.target.value })}
              fullWidth
              required
              placeholder="Desarrollo de Aplicaciones Full Stack Python"
            />
            <TextField
              label="Descripción"
              value={manualForm.descripcion}
              onChange={(e) => setManualForm({ ...manualForm, descripcion: e.target.value })}
              fullWidth
              multiline
              rows={3}
              placeholder="Descripción opcional del bootcamp"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenManualModal(false)}>Cancelar</Button>
          <Button 
            variant="contained" 
            onClick={() => createMutation.mutate(manualForm)}
            disabled={!manualForm.codigo || !manualForm.nombre || createMutation.isPending}
          >
            {createMutation.isPending ? 'Creando...' : 'Crear Bootcamp'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menu de 3 puntitos */}
      <Menu
        anchorEl={menuAnchor.el}
        open={Boolean(menuAnchor.el)}
        onClose={() => setMenuAnchor({ el: null, bootcamp: null })}
      >
        <MenuItem 
          onClick={() => {
            setDeleteModal({ open: true, bootcamp: menuAnchor.bootcamp })
            setMenuAnchor({ el: null, bootcamp: null })
          }}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} fontSize="small" />
          Eliminar Bootcamp
        </MenuItem>
      </Menu>

      {/* Modal de confirmación para eliminar */}
      <Dialog open={deleteModal.open} onClose={() => setDeleteModal({ open: false, bootcamp: null })} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Delete /> ¿Estás seguro?
        </DialogTitle>
        <DialogContent>
          <Typography>
            Se eliminará el bootcamp <strong>{deleteModal.bootcamp?.codigo}</strong> y todos sus {deleteModal.bootcamp?.total_estudiantes} estudiantes. Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteModal({ open: false, bootcamp: null })}>
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={() => deleteMutation.mutate(deleteModal.bootcamp?.id!)}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Eliminando...' : 'Sí, eliminar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
