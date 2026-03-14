from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.conversacion import ConversacionTipo


class UserSimple(BaseModel):
    id: int
    nombre: str

    class Config:
        from_attributes = True


class EstudianteSimple(BaseModel):
    id: int
    nombre: str
    apellido: str
    email: str

    class Config:
        from_attributes = True


class ConversacionBase(BaseModel):
    estudiante_id: int
    tipo: ConversacionTipo
    mensaje: str


class ConversacionCreate(ConversacionBase):
    pass


class Conversacion(ConversacionBase):
    id: int
    usuario_id: Optional[int] = None
    fecha: datetime

    class Config:
        from_attributes = True


class ConversacionWithRelations(Conversacion):
    usuario: Optional[UserSimple] = None
    estudiante: Optional[EstudianteSimple] = None
