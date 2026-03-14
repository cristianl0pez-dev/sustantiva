from sqlalchemy import Boolean, Column, Integer, String, Enum, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.db.base import Base


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    STUDENT_SUCCESS = "student_success"
    PROFESOR = "profesor"
    MENTOR = "mentor"


class User(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    nombre = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    rol = Column(Enum(UserRole), default=UserRole.STUDENT_SUCCESS, nullable=False)
    activo = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    estudiantes = relationship("Estudiante", back_populates="responsable")
    conversaciones = relationship("Conversacion", back_populates="usuario")
    notas = relationship("Nota", back_populates="autor")
    actividades = relationship("Actividad", back_populates="responsable")
