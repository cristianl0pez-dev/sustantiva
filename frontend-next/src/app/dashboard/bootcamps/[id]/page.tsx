'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { bootcamps, estudiantes } from '@/lib/api'
import KanbanBoard from '@/components/KanbanBoard'
import Link from 'next/link'
import {
  Box,
  Typography,
  Button,
  Breadcrumbs,
  Link as MuiLink,
  CircularProgress,
} from '@mui/material'
import {
  NavigateNext as NavigateNextIcon,
  Add as AddIcon,
} from '@mui/icons-material'

export default function BootcampKanbanPage() {
  const params = useParams()
  const bootcampId = parseInt(params.id as string)

  const { data: bootcamp } = useQuery({
    queryKey: ['bootcamp', bootcampId],
    queryFn: () => bootcamps.getById(bootcampId),
    enabled: !!bootcampId,
  })

  const { data: kanbanData, isLoading } = useQuery({
    queryKey: ['kanban', bootcampId],
    queryFn: () => estudiantes.getKanban(bootcampId),
    enabled: !!bootcampId,
  })

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
        <Box>
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            sx={{ mb: 0.5 }}
          >
            <MuiLink
              component={Link}
              href="/dashboard/bootcamps"
              color="text.secondary"
              underline="hover"
              sx={{ fontSize: '0.875rem' }}
            >
              Bootcamps
            </MuiLink>
            <Typography color="text.primary" sx={{ fontSize: '0.875rem' }}>
              {bootcamp?.nombre}
            </Typography>
          </Breadcrumbs>
          <Typography variant="h4" fontWeight="bold">
            {bootcamp?.nombre}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={Link}
          href={`/dashboard/estudiantes?bootcamp_id=${bootcampId}`}
        >
          Nuevo Estudiante
        </Button>
      </Box>

      <KanbanBoard initialData={kanbanData || {}} bootcampId={bootcampId} />
    </Box>
  )
}
