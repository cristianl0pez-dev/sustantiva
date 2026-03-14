'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { bootcamps, estudiantes } from '@/lib/api'
import KanbanBoard from '@/components/KanbanBoard'
import Link from 'next/link'

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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/dashboard/bootcamps" className="text-sm text-gray-500 hover:text-gray-700">
            ← Volver a Bootcamps
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            {bootcamp?.nombre}
          </h1>
        </div>
        <Link
          href={`/dashboard/estudiantes/nuevo?bootcamp_id=${bootcampId}`}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          + Nuevo Estudiante
        </Link>
      </div>

      <KanbanBoard initialData={kanbanData || {}} bootcampId={bootcampId} />
    </div>
  )
}
