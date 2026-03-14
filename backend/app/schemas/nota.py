from pydantic import BaseModel
from datetime import datetime
from typing import Optional


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


class NotaBase(BaseModel):
    estudiante_id: int
    contenido: str


class NotaCreate(NotaBase):
    pass


class Nota(NotaBase):
    id: int
    autor_id: Optional[int] = None
    fecha: datetime

    class Config:
        from_attributes = True


class NotaWithRelations(Nota):
    autor: Optional[UserSimple] = None
    estudiante: Optional[EstudianteSimple] = None
