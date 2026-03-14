from sqlalchemy import Column, Integer, String, Text, Date, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.db.base import Base


class EstudianteEstado(str, enum.Enum):
    NUEVO = "nuevo"
    ONBOARDING = "onboarding"
    ACTIVO = "activo"
    NECESITA_SEGUIMIENTO = "necesita_seguimiento"
    EN_RIESGO = "en_riesgo"
    REACTIVADO = "reactivado"
    ABANDONO = "abandono"
    GRADUADO = "graduado"


class Estudiante(Base):
    __tablename__ = "estudiantes"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255), nullable=False)
    apellido = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    telefono = Column(String(50))
    whatsapp = Column(String(50))
    bootcamp_id = Column(Integer, ForeignKey("bootcamps.id"))
    estado = Column(Enum(EstudianteEstado), default=EstudianteEstado.NUEVO)
    riesgo_desercion = Column(Integer, default=0)
    fecha_ingreso = Column(Date, default=func.now())
    ultimo_contacto = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    bootcamp = relationship("Bootcamp", back_populates="estudiantes")
    responsable = relationship("User", back_populates="estudiantes")
    responsable_id = Column(Integer, ForeignKey("usuarios.id"))
    conversaciones = relationship("Conversacion", back_populates="estudiante")
    notas = relationship("Nota", back_populates="estudiante")
    actividades = relationship("Actividad", back_populates="estudiante")
