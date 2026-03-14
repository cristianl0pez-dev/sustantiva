'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bootcamps } from '@/lib/api'
import { Bootcamp } from '@/types'
import Link from 'next/link'

export default function BootcampsPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
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
    const colors: Record<string, string> = {
      activo: 'bg-green-100 text-green-800',
      finalizado: 'bg-gray-100 text-gray-800',
      planificado: 'bg-blue-100 text-blue-800',
    }
    return colors[estado] || 'bg-gray-100 text-gray-800'
  }

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
        <h1 className="text-2xl font-bold text-gray-900">Bootcamps</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          {showForm ? 'Cancelar' : 'Nuevo Bootcamp'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Descripción</label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Estado</label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="planificado">Planificado</option>
                <option value="activo">Activo</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Creando...' : 'Crear Bootcamp'}
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bootcampsList?.map((bootcamp: Bootcamp) => (
          <div key={bootcamp.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{bootcamp.nombre}</h3>
                <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded ${getEstadoColor(bootcamp.estado)}`}>
                  {bootcamp.estado}
                </span>
              </div>
            </div>
            {bootcamp.descripcion && (
              <p className="mt-3 text-sm text-gray-500">{bootcamp.descripcion}</p>
            )}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-bold text-gray-900">{bootcamp.total_estudiantes || 0}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <div>
                <p className="text-lg font-bold text-green-600">{bootcamp.estudiantes_activos || 0}</p>
                <p className="text-xs text-gray-500">Activos</p>
              </div>
              <div>
                <p className="text-lg font-bold text-red-600">{bootcamp.estudiantes_en_riesgo || 0}</p>
                <p className="text-xs text-gray-500">Riesgo</p>
              </div>
            </div>
            <Link
              href={`/dashboard/bootcamps/${bootcamp.id}`}
              className="mt-4 block text-center text-sm text-primary-600 hover:text-primary-700"
            >
              Ver Kanban →
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
