from sqlalchemy import Column, Integer, DateTime
from sqlalchemy.sql import func

from app.db.base import Base


class ConfiguracionRiesgo(Base):
    __tablename__ = "configuracion_riesgo"

    id = Column(Integer, primary_key=True, index=True)
    umbral_riesgo = Column(Integer, default=60)
    dias_sin_moodle = Column(Integer, default=7)
    dias_sin_contacto = Column(Integer, default=14)
    ultima_ejecucion = Column(DateTime(timezone=True), nullable=True)
    estudiantes_evaluados = Column(Integer, default=0)
    tickets_creados = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
