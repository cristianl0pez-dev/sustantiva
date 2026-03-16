from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.models.ticket import (
    TicketTipo, TicketEstado, TicketNivel, TicketPrioridad, TicketCierreTipo,
    InteraccionTipo, CasoEstado
)


class TicketCreate(BaseModel):
    estudiante_id: int
    tipo: TicketTipo
    titulo: str
    descripcion: str
    prioridad: Optional[TicketPrioridad] = TicketPrioridad.MEDIA
    canal_origen: Optional[str] = "web"


class TicketUpdate(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    estado: Optional[TicketEstado] = None
    prioridad: Optional[TicketPrioridad] = None
    nivel: Optional[TicketNivel] = None
    asignado_a_id: Optional[int] = None
    resolucion: Optional[str] = None
    cierre_tipo: Optional[TicketCierreTipo] = None
    evidencia_link: Optional[str] = None
    obs_tecnica: Optional[str] = None
    etiquetas: Optional[str] = None


class TicketAsignar(BaseModel):
    asignado_a_id: int


class TicketCerrar(BaseModel):
    resolucion: str
    cierre_tipo: TicketCierreTipo


class TicketAsignarNivel(BaseModel):
    nivel: TicketNivel
    accion: Optional[str] = None


class TicketEscalar(BaseModel):
    nivel: TicketNivel
    motivo: str


class EstudianteSimple(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    nombre: str
    apellido: str
    email: str


class UsuarioSimple(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    nombre: str
    email: str


class InteraccionCreate(BaseModel):
    ticket_id: int
    tipo: InteraccionTipo
    contenido: str
    canal: Optional[str] = "web"
    es_automatica: bool = False


class InteraccionSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    ticket_id: int
    usuario_id: Optional[int]
    tipo: InteraccionTipo
    contenido: str
    canal: str
    es_automatica: bool
    created_at: datetime


class TicketSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    estudiante_id: int
    tipo: TicketTipo
    titulo: str
    descripcion: str
    estado: TicketEstado
    prioridad: TicketPrioridad
    nivel: Optional[TicketNivel]
    fecha_creacion: datetime
    fecha_cierre: Optional[datetime]
    fecha_ultima_actualizacion: datetime
    resolucion: Optional[str]
    cierre_tipo: Optional[TicketCierreTipo]
    asignado_a_id: Optional[int]
    etiquetas: Optional[str]
    canal_origen: str
    evidencia_link: Optional[str]
    obs_tecnica: Optional[str]
    
    estudiante: Optional[EstudianteSimple] = None
    asignado_a: Optional[UsuarioSimple] = None
    interacciones: Optional[List[InteraccionSchema]] = None


class TicketListSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    estudiante_id: int
    tipo: TicketTipo
    titulo: str
    estado: TicketEstado
    prioridad: TicketPrioridad
    nivel: Optional[TicketNivel]
    fecha_creacion: datetime
    fecha_ultima_actualizacion: datetime
    
    estudiante: Optional[EstudianteSimple] = None
    asignado_a: Optional[UsuarioSimple] = None


# Esquemas de Casos
class CasoCreate(BaseModel):
    estudiante_id: int
    ticket_id: Optional[int] = None
    canal_origen: str
    categoria: str
    sintoma_inicial: str


class CasoUpdate(BaseModel):
    etapa_1_filtro: Optional[str] = None
    etapa_2_accion: Optional[str] = None
    etapa_3_escalado: Optional[str] = None
    estado: Optional[CasoEstado] = None
    cierre_tipo: Optional[str] = None
    estado_final: Optional[str] = None
    evidencia_link: Optional[str] = None


class CasoSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    estudiante_id: int
    ticket_id: Optional[int]
    canal_origen: Optional[str]
    categoria: Optional[str]
    sintoma_inicial: Optional[str]
    etapa_1_filtro: Optional[str]
    etapa_2_accion: Optional[str]
    etapa_3_escalado: Optional[str]
    estado: CasoEstado
    cierre_tipo: Optional[str]
    estado_final: Optional[str]
    evidencia_link: Optional[str]
    fecha_creacion: datetime
    fecha_cierre: Optional[datetime]
    fecha_ultima_actualizacion: datetime
    
    estudiante: Optional[EstudianteSimple] = None


# Dashboard de Tickets
class TicketDashboard(BaseModel):
    total_tickets: int
    tickets_abiertos: int
    tickets_en_proceso: int
    tickets_resueltos: int
    tickets_cerrados: int
    tickets_urgentes: int
    tickets_por_tipo: dict
    tickets_por_prioridad: dict
    tickets_por_nivel: dict


# Opciones para selectores
class TicketOpciones(BaseModel):
    tipos: List[str] = [t.value for t in TicketTipo]
    estados: List[str] = [e.value for e in TicketEstado]
    prioridades: List[str] = [p.value for p in TicketPrioridad]
    niveles: List[str] = [n.value for n in TicketNivel]
    cierre_tipos: List[str] = [c.value for c in TicketCierreTipo]
