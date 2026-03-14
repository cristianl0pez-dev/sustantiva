export type UserRole = 'admin' | 'student_success' | 'profesor' | 'mentor';

export interface User {
  id: number;
  email: string;
  nombre: string;
  rol: UserRole;
  activo: boolean;
  created_at: string;
}

export interface Bootcamp {
  id: number;
  nombre: string;
  descripcion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  estado: 'activo' | 'finalizado' | 'planificado';
  created_at: string;
  total_estudiantes?: number;
  estudiantes_activos?: number;
  estudiantes_en_riesgo?: number;
}

export type EstudianteEstado = 
  | 'nuevo'
  | 'onboarding'
  | 'activo'
  | 'necesita_seguimiento'
  | 'en_riesgo'
  | 'reactivado'
  | 'abandono'
  | 'graduado';

export interface Estudiante {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  whatsapp?: string;
  bootcamp_id: number;
  estado: EstudianteEstado;
  riesgo_desercion: number;
  fecha_ingreso: string;
  ultimo_contacto?: string;
  created_at: string;
  bootcamp?: { id: number; nombre: string };
  responsable?: { id: number; nombre: string; email: string };
}

export interface EstudianteKanban {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  estado: EstudianteEstado;
  riesgo_desercion: number;
  bootcamp_nombre?: string;
  ultimo_contacto_dias?: number;
  responsable_id?: number;
}

export type KanbanColumns = Record<EstudianteEstado, EstudianteKanban[]>;

export type ConversacionTipo = 'email' | 'whatsapp' | 'llamada' | 'reunion';

export interface Conversacion {
  id: number;
  estudiante_id: number;
  tipo: ConversacionTipo;
  mensaje: string;
  usuario_id?: number;
  fecha: string;
}

export interface Nota {
  id: number;
  estudiante_id: number;
  autor_id?: number;
  contenido: string;
  fecha: string;
  autor?: { id: number; nombre: string };
}

export type ActividadEstado = 'pendiente' | 'en_progreso' | 'completada' | 'cancelada';

export interface Actividad {
  id: number;
  estudiante_id: number;
  titulo: string;
  descripcion?: string;
  fecha_limite?: string;
  estado: ActividadEstado;
  responsable_id?: number;
  created_at: string;
  estudiante?: { id: number; nombre: string; apellido: string };
  responsable?: { id: number; nombre: string };
}

export interface DashboardMetrics {
  total_estudiantes: number;
  estudiantes_activos: number;
  estudiantes_en_riesgo: number;
  estudiantes_reactivados: number;
  tasa_desercion: number;
  total_bootcamps: number;
  bootcamps_activos: number;
}

export interface EstudianteEnRiesgo {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  bootcamp_nombre: string;
  riesgo_desercion: number;
  ultimo_contacto_dias: number;
}

export interface AuthToken {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
