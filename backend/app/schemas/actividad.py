from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.actividad import ActividadEstado


class UserSimple(BaseModel):
    id: int
    nombre: str

    class Config:
        from_attributes = True


class EstudianteSimple(BaseModel):
    id: int
    nombre: str
    apellido: str

    class Config:
        from_attributes = True


class ActividadBase(BaseModel):
    estudiante_id: int
    titulo: str
    descripcion: Optional[str] = None
    fecha_limite: Optional[datetime] = None
    estado: ActividadEstado = ActividadEstado.PENDIENTE
    responsable_id: Optional[int] = None


class ActividadCreate(ActividadBase):
    pass


class ActividadUpdate(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    fecha_limite: Optional[datetime] = None
    estado: Optional[ActividadEstado] = None
    responsable_id: Optional[int] = None


class Actividad(ActividadBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ActividadWithRelations(Actividad):
    estudiante: Optional[EstudianteSimple] = None
    responsable: Optional[UserSimple] = None
