import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const response = await axios.post('/api/auth/refresh', null, {
            params: { refresh_token: refreshToken },
          })
          const { access_token, refresh_token } = response.data
          localStorage.setItem('access_token', access_token)
          localStorage.setItem('refresh_token', refresh_token)
          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return api(originalRequest)
        } catch {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export const auth = {
  login: async (username: string, password: string) => {
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)
    const response = await axios.post('/api/auth/login', formData)
    return response.data
  },
  me: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },
}

export const bootcamps = {
  getAll: async () => {
    const response = await api.get('/bootcamps')
    return response.data
  },
  getById: async (id: number) => {
    const response = await api.get(`/bootcamps/${id}`)
    return response.data
  },
  create: async (data: any) => {
    const response = await api.post('/bootcamps', data)
    return response.data
  },
  importExcel: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/bootcamps/importar-excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
}

export const estudiantes = {
  getAll: async (params?: { bootcamp_id?: number }) => {
    const response = await api.get('/estudiantes', { params })
    return response.data
  },
  getKanban: async (bootcampId?: number) => {
    const response = await api.get('/estudiantes/kanban', { params: { bootcamp_id: bootcampId } })
    return response.data
  },
  create: async (data: any) => {
    const response = await api.post('/estudiantes', data)
    return response.data
  },
  updateStatus: async (id: number, estado: string) => {
    const response = await api.patch(`/estudiantes/${id}/status`, null, { params: { estado } })
    return response.data
  },
}

export const dashboard = {
  getMetrics: async () => {
    const response = await api.get('/dashboard')
    return response.data
  },
  getEnRiesgo: async () => {
    const response = await api.get('/dashboard/riesgo')
    return response.data
  },
  getActividadesPendientes: async () => {
    const response = await api.get('/dashboard/actividades-pendientes')
    return response.data
  },
}

export const tickets = {
  getAll: async (params?: { estado?: string; tipo?: string }) => {
    const response = await api.get('/tickets', { params })
    return response.data
  },
  getById: async (id: number) => {
    const response = await api.get(`/tickets/${id}`)
    return response.data
  },
  create: async (data: any) => {
    const response = await api.post('/tickets', data)
    return response.data
  },
  getOpciones: async () => {
    const response = await api.get('/tickets/opciones')
    return response.data
  },
  createInteraccion: async (id: number, data: { tipo: string; contenido: string; canal?: string }) => {
    const response = await api.post(`/tickets/${id}/interacciones`, data)
    return response.data
  },
  cerrar: async (id: number, resolucion: string, cierre_tipo: string) => {
    const response = await api.post(`/tickets/${id}/cerrar`, { resolucion, cierre_tipo })
    return response.data
  },
}

export default api
