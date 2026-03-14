from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional
from app.models.bootcamp import BootcampEstado


class BootcampBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    estado: BootcampEstado = BootcampEstado.ACTIVO


class BootcampCreate(BootcampBase):
    pass


class BootcampUpdate(BootcampBase):
    pass


class Bootcamp(BootcampBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


BootcampSchema = Bootcamp


class BootcampWithCount(Bootcamp):
    total_estudiantes: int = 0
    estudiantes_activos: int = 0
    estudiantes_en_riesgo: int = 0
