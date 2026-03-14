'use client'

import { useQuery } from '@tanstack/react-query'
import { dashboard } from '@/lib/api'

export default function DashboardPage() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboard.getMetrics,
  })

  const { data: enRiesgo } = useQuery({
    queryKey: ['en-riesgo'],
    queryFn: dashboard.getEnRiesgo,
  })

  const { data: actividades } = useQuery({
    queryKey: ['actividades-pendientes'],
    queryFn: dashboard.getActividadesPendientes,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const statCards = [
    { label: 'Total Estudiantes', value: metrics?.total_estudiantes || 0, color: 'blue' },
    { label: 'Activos', value: metrics?.estudiantes_activos || 0, color: 'green' },
    { label: 'En Riesgo', value: metrics?.estudiantes_en_riesgo || 0, color: 'red' },
    { label: 'Tasa Deserción', value: `${metrics?.tasa_desercion || 0}%`, color: 'yellow' },
  ]

  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow p-6">
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p className={`text-3xl font-bold mt-2 ${colorClasses[stat.color]}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Estudiantes en Riesgo
          </h2>
          <div className="space-y-3">
            {enRiesgo?.slice(0, 5).map((est: any) => (
              <div key={est.id} className="flex items-center justify-between p-3 bg-red-50 rounded-md">
                <div>
                  <p className="font-medium text-gray-900">
                    {est.nombre} {est.apellido}
                  </p>
                  <p className="text-sm text-gray-500">{est.bootcamp_nombre}</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-600 rounded">
                    {est.riesgo_desercion}%
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {est.ultimo_contacto_dias} días sin contacto
                  </p>
                </div>
              </div>
            ))}
            {(!enRiesgo || enRiesgo.length === 0) && (
              <p className="text-gray-500 text-center py-4">No hay estudiantes en riesgo</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Actividades Pendientes
          </h2>
          <div className="space-y-3">
            {actividades?.slice(0, 5).map((act: any) => (
              <div key={act.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-md">
                <div>
                  <p className="font-medium text-gray-900">{act.titulo}</p>
                  <p className="text-sm text-gray-500">{act.estudiante_nombre}</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-600 rounded">
                    {act.estado}
                  </span>
                  {act.fecha_limite && (
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(act.fecha_limite).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {(!actividades || actividades.length === 0) && (
              <p className="text-gray-500 text-center py-4">No hay actividades pendientes</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
