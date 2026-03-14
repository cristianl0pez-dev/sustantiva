'use client'

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { estudiantes } from '@/lib/api'
import { EstudianteEstado, EstudianteKanban, KanbanColumns } from '@/types'
import { useQueryClient } from '@tanstack/react-query'
import { Box, Typography, Paper, Chip, Avatar } from '@mui/material'
import {
  Person as PersonIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material'

const COLUMN_ORDER: EstudianteEstado[] = [
  'nuevo',
  'onboarding',
  'activo',
  'necesita_seguimiento',
  'en_riesgo',
  'reactivado',
  'abandono',
  'graduado',
]

const COLUMN_LABELS: Record<EstudianteEstado, string> = {
  nuevo: 'Nuevo',
  onboarding: 'Onboarding',
  activo: 'Activo',
  necesita_seguimiento: 'Seguimiento',
  en_riesgo: 'En Riesgo',
  reactivado: 'Reactivado',
  abandono: 'Abandonó',
  graduado: 'Graduado',
}

const COLUMN_COLORS: Record<EstudianteEstado, { bg: string; border: string; chip: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' }> = {
  nuevo: { bg: '#eff6ff', border: '#bfdbfe', chip: 'primary' },
  onboarding: { bg: '#faf5ff', border: '#e9d5ff', chip: 'secondary' },
  activo: { bg: '#ecfdf5', border: '#a7f3d0', chip: 'success' },
  necesita_seguimiento: { bg: '#fffbeb', border: '#fde68a', chip: 'warning' },
  en_riesgo: { bg: '#fef2f2', border: '#fecaca', chip: 'error' },
  reactivado: { bg: '#fff7ed', border: '#fed7aa', chip: 'warning' },
  abandono: { bg: '#f9fafb', border: '#e5e7eb', chip: 'default' },
  graduado: { bg: '#ecfdf5', border: '#a7f3d0', chip: 'success' },
}

interface KanbanBoardProps {
  initialData: KanbanColumns
  bootcampId?: number
}

export default function KanbanBoard({ initialData, bootcampId }: KanbanBoardProps) {
  const [columns, setColumns] = useState<KanbanColumns>(initialData)
  const queryClient = useQueryClient()

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const sourceColumn = source.droppableId as EstudianteEstado
    const destColumn = destination.droppableId as EstudianteEstado

    const sourceItems = [...columns[sourceColumn]]
    const [movedItem] = sourceItems.splice(source.index, 1)

    if (sourceColumn === destColumn) {
      sourceItems.splice(destination.index, 0, movedItem)
      setColumns({
        ...columns,
        [sourceColumn]: sourceItems,
      })
    } else {
      const destItems = [...columns[destColumn]]
      const updatedItem = { ...movedItem, estado: destColumn }
      destItems.splice(destination.index, 0, updatedItem)

      setColumns({
        ...columns,
        [sourceColumn]: sourceItems,
        [destColumn]: destItems,
      })

      try {
        await estudiantes.updateStatus(parseInt(draggableId), destColumn)
        queryClient.invalidateQueries({ queryKey: ['kanban'] })
      } catch (error) {
        console.error('Error updating status:', error)
        setColumns(initialData)
      }
    }
  }

  const getRiskColor = (riesgo: number) => {
    if (riesgo >= 60) return 'error'
    if (riesgo >= 30) return 'warning'
    return 'success'
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          pb: 2,
        }}
      >
        {COLUMN_ORDER.map((columnId) => {
          const colorScheme = COLUMN_COLORS[columnId]
          return (
            <Box
              key={columnId}
              sx={{
                flexShrink: 0,
                width: 280,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  bgcolor: colorScheme.bg,
                  border: '1px solid',
                  borderColor: colorScheme.border,
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    borderBottom: '1px solid',
                    borderColor: colorScheme.border,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {COLUMN_LABELS[columnId]}
                    </Typography>
                    <Chip
                      label={columns[columnId]?.length || 0}
                      size="small"
                      color={colorScheme.chip}
                      sx={{ height: 22, fontSize: '0.7rem' }}
                    />
                  </Box>
                </Box>
                <Droppable droppableId={columnId}>
                  {(provided, snapshot) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{
                        p: 1,
                        minHeight: 200,
                        bgcolor: snapshot.isDraggingOver ? 'rgba(255,255,255,0.5)' : 'transparent',
                        transition: 'background-color 0.2s',
                      }}
                    >
                      {columns[columnId]?.map((student, index) => (
                        <Draggable key={student.id.toString()} draggableId={student.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <Paper
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              elevation={snapshot.isDragging ? 4 : 0}
                              sx={{
                                p: 1.5,
                                mb: 1,
                                borderRadius: 1.5,
                                bgcolor: 'background.paper',
                                border: '1px solid',
                                borderColor: 'divider',
                                boxShadow: snapshot.isDragging ? '0 8px 16px rgba(0,0,0,0.15)' : 'none',
                                transition: 'box-shadow 0.2s, transform 0.2s',
                                transform: snapshot.isDragging ? 'rotate(2deg)' : 'none',
                                cursor: 'grab',
                                '&:hover': {
                                  boxShadow: 1,
                                },
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                <Avatar
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    bgcolor: colorScheme.chip === 'default' ? 'grey.400' : `${colorScheme.chip}.main`,
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                  }}
                                >
                                  {student.nombre.charAt(0)}
                                </Avatar>
                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                  <Typography variant="body2" fontWeight={600} noWrap>
                                    {student.nombre} {student.apellido}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" noWrap display="block">
                                    {student.bootcamp_nombre}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                                  <Box
                                    sx={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: '50%',
                                      bgcolor: getRiskColor(student.riesgo_desercion) === 'error' 
                                        ? 'error.main' 
                                        : getRiskColor(student.riesgo_desercion) === 'warning'
                                        ? 'warning.main'
                                        : 'success.main',
                                    }}
                                  />
                                  {student.ultimo_contacto_dias !== undefined && student.ultimo_contacto_dias !== null && (
                                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
                                      {student.ultimo_contacto_dias}d
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </Paper>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </Box>
                  )}
                </Droppable>
              </Paper>
            </Box>
          )
        })}
      </Box>
    </DragDropContext>
  )
}
