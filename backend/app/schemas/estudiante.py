from pydantic import BaseModel, EmailStr
from datetime import date, datetime
from typing import Optional, TYPE_CHECKING
from app.models.estudiante import EstudianteEstado


class BootcampSimple(BaseModel):
    id: int
    nombre: str

    class Config:
        from_attributes = True


class UserSimple(BaseModel):
    id: int
    nombre: str
    email: str

    class Config:
        from_attributes = True


class EstudianteBase(BaseModel):
    nombre: str
    apellido: str
    email: EmailStr
    telefono: Optional[str] = None
    whatsapp: Optional[str] = None
    bootcamp_id: int
    estado: EstudianteEstado = EstudianteEstado.NUEVO
    responsable_id: Optional[int] = None


class EstudianteCreate(EstudianteBase):
    pass


class EstudianteUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    whatsapp: Optional[str] = None
    bootcamp_id: Optional[int] = None
    estado: Optional[EstudianteEstado] = None
    responsable_id: Optional[int] = None
    riesgo_desercion: Optional[int] = None


class Estudiante(EstudianteBase):
    id: int
    riesgo_desercion: int = 0
    fecha_ingreso: date
    ultimo_contacto: Optional[datetime] = None
    ultimo_acceso_moodle: Optional[datetime] = None
    created_at: datetime
    bootcamp_nombre: Optional[str] = None

    class Config:
        from_attributes = True


EstudianteSchema = Estudiante


class EstudianteWithRelations(Estudiante):
    bootcamp: Optional[BootcampSimple] = None
    responsable: Optional[UserSimple] = None
    notas: list = []
    conversaciones: list = []
    tickets: list = []


class EstudianteKanban(Estudiante):
    bootcamp_nombre: Optional[str] = None
    ultimo_contacto_dias: Optional[int] = None
