'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { estudiantes, conversaciones, notas, actividades } from '@/lib/api'
import { Conversacion, Nota, Actividad, Estudiante } from '@/types'

type Tab = 'info' | 'conversaciones' | 'notas' | 'actividades'

export default function EstudiantePerfilPage() {
  const params = useParams()
  const estudianteId = parseInt(params.id as string)
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<Tab>('info')
  const [showConvForm, setShowConvForm] = useState(false)
  const [showNotaForm, setShowNotaForm] = useState(false)
  const [showActividadForm, setShowActividadForm] = useState(false)

  const [convData, setConvData] = useState({ tipo: 'whatsapp', mensaje: '' })
  const [notaData, setNotaData] = useState({ contenido: '' })
  const [actividadData, setActividadData] = useState({ titulo: '', descripcion: '', fecha_limite: '', estado: 'pendiente' })

  const { data: estudiante, isLoading } = useQuery({
    queryKey: ['estudiante', estudianteId],
    queryFn: () => estudiantes.getById(estudianteId),
    enabled: !!estudianteId,
  })

  const { data: conversacionesList } = useQuery({
    queryKey: ['conversaciones', estudianteId],
    queryFn: () => conversaciones.getAll(estudianteId),
    enabled: !!estudianteId,
  })

  const { data: notasList } = useQuery({
    queryKey: ['notas', estudianteId],
    queryFn: () => notas.getAll(estudianteId),
    enabled: !!estudianteId,
  })

  const { data: actividadesList } = useQuery({
    queryKey: ['actividades', estudianteId],
    queryFn: () => actividades.getAll({ estudiante_id: estudianteId }),
    enabled: !!estudianteId,
  })

  const convMutation = useMutation({
    mutationFn: conversaciones.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversaciones', estudianteId] })
      setShowConvForm(false)
      setConvData({ tipo: 'whatsapp', mensaje: '' })
    },
  })

  const notaMutation = useMutation({
    mutationFn: notas.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas', estudianteId] })
      setShowNotaForm(false)
      setNotaData({ contenido: '' })
    },
  })

  const actividadMutation = useMutation({
    mutationFn: actividades.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actividades', estudianteId] })
      setShowActividadForm(false)
      setActividadData({ titulo: '', descripcion: '', fecha_limite: '', estado: 'pendiente' })
    },
  })

  const handleConvSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    convMutation.mutate({ ...convData, estudiante_id: estudianteId })
  }

  const handleNotaSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    notaMutation.mutate({ ...notaData, estudiante_id: estudianteId })
  }

  const handleActividadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    actividadMutation.mutate({
      ...actividadData,
      estudiante_id: estudianteId,
      fecha_limite: actividadData.fecha_limite || null,
    })
  }

  const getTipoIcon = (tipo: string) => {
    const icons: Record<string, string> = { email: '📧', whatsapp: '💬', llamada: '📞', reunion: '📅' }
    return icons[tipo] || '💬'
  }

  const getEstadoColor = (estado: string) => {
    const colors: Record<string, string> = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      en_progreso: 'bg-blue-100 text-blue-800',
      completada: 'bg-green-100 text-green-800',
      cancelada: 'bg-gray-100 text-gray-800',
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

  const tabs = [
    { id: 'info', label: 'Información' },
    { id: 'conversaciones', label: 'Conversaciones' },
    { id: 'notas', label: 'Notas' },
    { id: 'actividades', label: 'Actividades' },
  ]

  return (
    <div>
      <Link href="/dashboard/estudiantes" className="text-sm text-gray-500 hover:text-gray-700">
        ← Volver a Estudiantes
      </Link>

      <div className="mt-4 bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {estudiante?.nombre} {estudiante?.apellido}
              </h1>
              <p className="text-gray-500">{estudiante?.email}</p>
              {estudiante?.bootcamp && (
                <span className="inline-block mt-2 px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded">
                  {estudiante.bootcamp.nombre}
                </span>
              )}
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-2">
                <span className="text-sm text-gray-500">Riesgo:</span>
                <span className={`px-2 py-1 text-sm font-medium rounded ${
                  (estudiante?.riesgo_desercion || 0) >= 60 ? 'bg-red-100 text-red-800' :
                  (estudiante?.riesgo_desercion || 0) >= 30 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}>
                  {estudiante?.riesgo_desercion || 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'info' && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Datos de contacto</h3>
                <dl className="space-y-2">
                  <div><dt className="text-sm text-gray-500">Email</dt><dd className="text-sm text-gray-900">{estudiante?.email}</dd></div>
                  <div><dt className="text-sm text-gray-500">Teléfono</dt><dd className="text-sm text-gray-900">{estudiante?.telefono || '-'}</dd></div>
                  <div><dt className="text-sm text-gray-500">WhatsApp</dt><dd className="text-sm text-gray-900">{estudiante?.whatsapp || '-'}</dd></div>
                </dl>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Información del curso</h3>
                <dl className="space-y-2">
                  <div><dt className="text-sm text-gray-500">Fecha de ingreso</dt><dd className="text-sm text-gray-900">{estudiante?.fecha_ingreso}</dd></div>
                  <div><dt className="text-sm text-gray-500">Último contacto</dt><dd className="text-sm text-gray-900">{estudiante?.ultimo_contacto ? new Date(estudiante.ultimo_contacto).toLocaleString() : 'Sin contacto'}</dd></div>
                  <div><dt className="text-sm text-gray-500">Responsable</dt><dd className="text-sm text-gray-900">{estudiante?.responsable?.nombre || '-'}</dd></div>
                </dl>
              </div>
            </div>
          )}

          {activeTab === 'conversaciones' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-900">Historial de conversaciones</h3>
                <button onClick={() => setShowConvForm(!showConvForm)} className="text-sm text-primary-600 hover:text-primary-700">
                  + Nueva conversación
                </button>
              </div>
              {showConvForm && (
                <form onSubmit={handleConvSubmit} className="bg-gray-50 p-4 rounded-lg mb-4 space-y-3">
                  <select value={convData.tipo} onChange={(e) => setConvData({ ...convData, tipo: e.target.value })} className="w-full px-3 py-2 border rounded-md">
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                    <option value="llamada">Llamada</option>
                    <option value="reunion">Reunión</option>
                  </select>
                  <textarea value={convData.mensaje} onChange={(e) => setConvData({ ...convData, mensaje: e.target.value })} placeholder="Mensaje..." className="w-full px-3 py-2 border rounded-md" rows={3} required />
                  <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm">Guardar</button>
                </form>
              )}
              <div className="space-y-3">
                {conversacionesList?.map((conv: Conversacion) => (
                  <div key={conv.id} className="border-l-4 border-primary-300 pl-4 py-2">
                    <div className="flex items-center gap-2">
                      <span>{getTipoIcon(conv.tipo)}</span>
                      <span className="text-sm font-medium">{conv.tipo}</span>
                      <span className="text-xs text-gray-500">{new Date(conv.fecha).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{conv.mensaje}</p>
                  </div>
                ))}
                {(!conversacionesList || conversacionesList.length === 0) && <p className="text-gray-500">No hay conversaciones</p>}
              </div>
            </div>
          )}

          {activeTab === 'notas' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-900">Notas internas</h3>
                <button onClick={() => setShowNotaForm(!showNotaForm)} className="text-sm text-primary-600 hover:text-primary-700">
                  + Nueva nota
                </button>
              </div>
              {showNotaForm && (
                <form onSubmit={handleNotaSubmit} className="bg-gray-50 p-4 rounded-lg mb-4 space-y-3">
                  <textarea value={notaData.contenido} onChange={(e) => setNotaData({ ...notaData, contenido: e.target.value })} placeholder="Nota..." className="w-full px-3 py-2 border rounded-md" rows={3} required />
                  <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm">Guardar</button>
                </form>
              )}
              <div className="space-y-3">
                {notasList?.map((nota: Nota) => (
                  <div key={nota.id} className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <p className="text-sm text-gray-700">{nota.contenido}</p>
                      <span className="text-xs text-gray-500">{new Date(nota.fecha).toLocaleString()}</span>
                    </div>
                    {nota.autor && <p className="text-xs text-gray-500 mt-2">Por: {nota.autor.nombre}</p>}
                  </div>
                ))}
                {(!notasList || notasList.length === 0) && <p className="text-gray-500">No hay notas</p>}
              </div>
            </div>
          )}

          {activeTab === 'actividades' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-900">Tareas de seguimiento</h3>
                <button onClick={() => setShowActividadForm(!showActividadForm)} className="text-sm text-primary-600 hover:text-primary-700">
                  + Nueva tarea
                </button>
              </div>
              {showActividadForm && (
                <form onSubmit={handleActividadSubmit} className="bg-gray-50 p-4 rounded-lg mb-4 space-y-3">
                  <input type="text" value={actividadData.titulo} onChange={(e) => setActividadData({ ...actividadData, titulo: e.target.value })} placeholder="Título" className="w-full px-3 py-2 border rounded-md" required />
                  <textarea value={actividadData.descripcion} onChange={(e) => setActividadData({ ...actividadData, descripcion: e.target.value })} placeholder="Descripción" className="w-full px-3 py-2 border rounded-md" rows={2} />
                  <input type="datetime-local" value={actividadData.fecha_limite} onChange={(e) => setActividadData({ ...actividadData, fecha_limite: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
                  <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm">Guardar</button>
                </form>
              )}
              <div className="space-y-3">
                {actividadesList?.map((act: Actividad) => (
                  <div key={act.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{act.titulo}</p>
                      {act.descripcion && <p className="text-sm text-gray-500">{act.descripcion}</p>}
                      {act.fecha_limite && <p className="text-xs text-gray-400">Límite: {new Date(act.fecha_limite).toLocaleString()}</p>}
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getEstadoColor(act.estado)}`}>
                      {act.estado}
                    </span>
                  </div>
                ))}
                {(!actividadesList || actividadesList.length === 0) && <p className="text-gray-500">No hay actividades</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
