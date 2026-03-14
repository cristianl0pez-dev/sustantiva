'use client'

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { estudiantes } from '@/lib/api'
import { EstudianteEstado, EstudianteKanban, KanbanColumns } from '@/types'
import { useQueryClient } from '@tanstack/react-query'

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
  necesita_seguimiento: 'Necesita Seguimiento',
  en_riesgo: 'En Riesgo',
  reactivado: 'Reactivado',
  abandono: 'Abandonó',
  graduado: 'Graduado',
}

const COLUMN_COLORS: Record<EstudianteEstado, string> = {
  nuevo: 'bg-blue-50 border-blue-200',
  onboarding: 'bg-purple-50 border-purple-200',
  activo: 'bg-green-50 border-green-200',
  necesita_seguimiento: 'bg-yellow-50 border-yellow-200',
  en_riesgo: 'bg-red-50 border-red-200',
  reactivado: 'bg-orange-50 border-orange-200',
  abandono: 'bg-gray-50 border-gray-200',
  graduado: 'bg-emerald-50 border-emerald-200',
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
    if (riesgo >= 60) return 'bg-red-500'
    if (riesgo >= 30) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMN_ORDER.map((columnId) => (
          <div key={columnId} className={`flex-shrink-0 w-72 ${COLUMN_COLORS[columnId]} rounded-lg border`}>
            <div className="p-3 border-b">
              <h3 className="font-semibold text-gray-900">{COLUMN_LABELS[columnId]}</h3>
              <p className="text-sm text-gray-500">{columns[columnId]?.length || 0} estudiantes</p>
            </div>
            <Droppable droppableId={columnId}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`p-2 min-h-[200px] ${snapshot.isDraggingOver ? 'bg-white/50' : ''}`}
                >
                  {columns[columnId]?.map((student, index) => (
                    <Draggable key={student.id.toString()} draggableId={student.id.toString()} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`bg-white rounded-lg shadow-sm p-3 mb-2 ${
                            snapshot.isDragging ? 'shadow-lg ring-2 ring-primary-500' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                {student.nombre} {student.apellido}
                              </p>
                              <p className="text-sm text-gray-500">{student.bootcamp_nombre}</p>
                            </div>
                            <div className="flex flex-col items-end">
                              <div className={`w-3 h-3 rounded-full ${getRiskColor(student.riesgo_desercion)}`} title={`Riesgo: ${student.riesgo_desercion}%`} />
                              {student.ultimo_contacto_dias !== undefined && student.ultimo_contacto_dias !== null && (
                                <span className="text-xs text-gray-400 mt-1">
                                  {student.ultimo_contacto_dias}d
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  )
}
