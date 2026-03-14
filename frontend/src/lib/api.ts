import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, null, {
            params: { refresh_token: refreshToken },
          });
          const { access_token, refresh_token } = response.data;
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: async (username: string, password: string) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    const response = await api.post('/auth/login', formData);
    return response.data;
  },
  register: async (data: { email: string; nombre: string; password: string; rol: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const bootcamps = {
  getAll: async () => {
    const response = await api.get('/bootcamps');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/bootcamps/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/bootcamps', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/bootcamps/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/bootcamps/${id}`);
    return response.data;
  },
};

export const estudiantes = {
  getAll: async (params?: { bootcamp_id?: number; estado?: string }) => {
    const response = await api.get('/estudiantes', { params });
    return response.data;
  },
  getKanban: async (bootcamp_id?: number) => {
    const response = await api.get('/estudiantes/kanban', { params: { bootcamp_id } });
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/estudiantes/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/estudiantes', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.patch(`/estudiantes/${id}`, data);
    return response.data;
  },
  updateStatus: async (id: number, estado: string) => {
    const response = await api.patch(`/estudiantes/${id}/status`, null, { params: { estado } });
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/estudiantes/${id}`);
    return response.data;
  },
};

export const conversaciones = {
  getAll: async (estudiante_id?: number) => {
    const response = await api.get('/conversaciones', { params: { estudiante_id } });
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/conversaciones', data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/conversaciones/${id}`);
    return response.data;
  },
};

export const notas = {
  getAll: async (estudiante_id?: number) => {
    const response = await api.get('/notas', { params: { estudiante_id } });
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/notas', data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/notas/${id}`);
    return response.data;
  },
};

export const actividades = {
  getAll: async (params?: { estudiante_id?: number; estado?: string }) => {
    const response = await api.get('/actividades', { params });
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/actividades', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.patch(`/actividades/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/actividades/${id}`);
    return response.data;
  },
};

export const dashboard = {
  getMetrics: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  },
  getEnRiesgo: async () => {
    const response = await api.get('/dashboard/riesgo');
    return response.data;
  },
  getActividadesPendientes: async () => {
    const response = await api.get('/dashboard/actividades-pendientes');
    return response.data;
  },
};

export default api;
