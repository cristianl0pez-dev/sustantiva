from sqlalchemy import Column, Integer, String, Text, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.db.base import Base


class ConversacionTipo(str, enum.Enum):
    EMAIL = "email"
    WHATSAPP = "whatsapp"
    LLAMADA = "llamada"
    REUNION = "reunion"


class Conversacion(Base):
    __tablename__ = "conversaciones"

    id = Column(Integer, primary_key=True, index=True)
    estudiante_id = Column(Integer, ForeignKey("estudiantes.id"))
    tipo = Column(Enum(ConversacionTipo), nullable=False)
    mensaje = Column(Text, nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    fecha = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    estudiante = relationship("Estudiante", back_populates="conversaciones")
    usuario = relationship("User", back_populates="conversaciones")
