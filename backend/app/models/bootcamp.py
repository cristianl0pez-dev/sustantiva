from sqlalchemy import Column, Integer, String, Text, Date, Enum, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.db.base import Base


class BootcampEstado(str, enum.Enum):
    ACTIVO = "activo"
    FINALIZADO = "finalizado"
    PLANIFICADO = "planificado"


class Bootcamp(Base):
    __tablename__ = "bootcamps"

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(50), unique=True, index=True, nullable=False)
    nombre = Column(String(255), nullable=False)
    descripcion = Column(Text)
    fecha_inicio = Column(Date)
    fecha_fin = Column(Date)
    estado = Column(Enum(BootcampEstado), default=BootcampEstado.ACTIVO)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    estudiantes = relationship("Estudiante", back_populates="bootcamp")
