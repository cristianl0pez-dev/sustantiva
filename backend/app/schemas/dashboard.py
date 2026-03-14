from pydantic import BaseModel
from typing import List, Dict, Any


class DashboardMetrics(BaseModel):
    total_estudiantes: int = 0
    estudiantes_activos: int = 0
    estudiantes_en_riesgo: int = 0
    estudiantes_reactivados: int = 0
    tasa_desercion: float = 0.0
    total_bootcamps: int = 0
    bootcamps_activos: int = 0


class KanbanColumn(BaseModel):
    estado: str
    estudiantes: List[Dict[str, Any]] = []


class ActividadReciente(BaseModel):
    id: int
    titulo: str
    estudiante_nombre: str
    estudiante_apellido: str
    fecha_limite: Any
    estado: str


class EstudianteEnRiesgo(BaseModel):
    id: int
    nombre: str
    apellido: str
    email: str
    bootcamp_nombre: str
    riesgo_desercion: int
    ultimo_contacto_dias: int
