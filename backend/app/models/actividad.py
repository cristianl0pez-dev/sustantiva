from sqlalchemy import Column, Integer, String, Text, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.db.base import Base


class ActividadEstado(str, enum.Enum):
    PENDIENTE = "pendiente"
    EN_PROGRESO = "en_progreso"
    COMPLETADA = "completada"
    CANCELADA = "cancelada"


class Actividad(Base):
    __tablename__ = "actividades"

    id = Column(Integer, primary_key=True, index=True)
    estudiante_id = Column(Integer, ForeignKey("estudiantes.id"))
    titulo = Column(String(255), nullable=False)
    descripcion = Column(Text)
    fecha_limite = Column(DateTime(timezone=True))
    estado = Column(Enum(ActividadEstado), default=ActividadEstado.PENDIENTE)
    responsable_id = Column(Integer, ForeignKey("usuarios.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    estudiante = relationship("Estudiante", back_populates="actividades")
    responsable = relationship("User", back_populates="actividades")
