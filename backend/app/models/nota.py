from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class Nota(Base):
    __tablename__ = "notas"

    id = Column(Integer, primary_key=True, index=True)
    estudiante_id = Column(Integer, ForeignKey("estudiantes.id"))
    autor_id = Column(Integer, ForeignKey("usuarios.id"))
    contenido = Column(Text, nullable=False)
    fecha = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    estudiante = relationship("Estudiante", back_populates="notas")
    autor = relationship("User", back_populates="notas")
