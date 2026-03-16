from sqlalchemy import Column, Integer, String, Text, Enum, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.db.base import Base


class TicketTipo(str, enum.Enum):
    ACCESO = "acceso"
    ENLACE_CLASE = "enlace_clase"
    TECNICO = "tecnico"
    MATERIALES = "materiales"
    ASISTENCIA = "asistencia"
    EVALUACION = "evaluacion"
    TAREA_FEEDBACK = "tarea_feedback"
    ADMINISTRATIVO = "administrativo"
    CERTIFICACION = "certificacion"
    SUBSIDIO = "subsidio"
    OTRO = "otro"


class TicketEstado(str, enum.Enum):
    ABIERTO = "abierto"
    EN_PROCESO = "en_proceso"
    ESPERA = "espera"
    RESUELTO = "resuelto"
    CERRADO = "cerrado"


class TicketNivel(str, enum.Enum):
    NIVEL_1 = "nivel_1"  # Self-Service
    NIVEL_2 = "nivel_2"  # Technical / Content
    NIVEL_3 = "nivel_3"  # Academic Management


class TicketPrioridad(str, enum.Enum):
    BAJA = "baja"
    MEDIA = "media"
    ALTA = "alta"
    URGENTE = "urgente"


class TicketCierreTipo(str, enum.Enum):
    RESUELTO = "resuelto"
    DUPLICADO = "duplicado"
    NO_PROCEDE = "no_procede"
    ESTUDIANTE_NO_RESPONDE = "estudiante_no_responde"
    ESCALADO = "escalado"


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    
    # Estudiante
    estudiante_id = Column(Integer, ForeignKey("estudiantes.id"), nullable=False)
    
    # Clasificación
    tipo = Column(Enum(TicketTipo), nullable=False)
    titulo = Column(String(500), nullable=False)
    descripcion = Column(Text, nullable=False)
    
    # Estado y prioridd
    estado = Column(Enum(TicketEstado), default=TicketEstado.ABIERTO)
    prioridad = Column(Enum(TicketPrioridad), default=TicketPrioridad.MEDIA)
    nivel = Column(Enum(TicketNivel), nullable=True)
    
    # Fechas
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())
    fecha_cierre = Column(DateTime(timezone=True))
    fecha_ultima_actualizacion = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Resolución
    resolucion = Column(Text)
    cierre_tipo = Column(Enum(TicketCierreTipo))
    
    # Asignación
    asignado_a_id = Column(Integer, ForeignKey("usuarios.id"))
    
    # Tracking
    etiquetas = Column(String(500))  # Comma-separated tags
    
    # Metadata
    canal_origen = Column(String(50), default="web")
    evidencia_link = Column(String(1000))
    obs_tecnica = Column(Text)
    
    # Relaciones
    estudiante = relationship("Estudiante", back_populates="tickets")
    asignado_a = relationship("User")
    interacciones = relationship("Interaccion", back_populates="ticket", cascade="all, delete-orphan")


class InteraccionTipo(str, enum.Enum):
    MENSAJE_ENTRANTE = "mensaje_entrante"
    MENSAJE_SALIENTE = "mensaje_saliente"
    NOTA_INTERNA = "nota_interna"
    CAMBIO_ESTADO = "cambio_estado"
    ASIGNACION = "asignacion"
    RESPUESTA_AUTOMATICA = "respuesta_automatica"


class Interaccion(Base):
    __tablename__ = "interacciones"

    id = Column(Integer, primary_key=True, index=True)
    
    # Referencia al ticket
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    
    # Tipo de interacción
    tipo = Column(Enum(InteraccionTipo), nullable=False)
    contenido = Column(Text, nullable=False)
    
    # Metadata
    canal = Column(String(50), default="web")  # whatsapp, email, web, etc.
    es_automatica = Column(Boolean, default=False)
    
    # Fechas
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relaciones
    ticket = relationship("Ticket", back_populates="interacciones")
    usuario = relationship("User")


class CasoEstado(str, enum.Enum):
    ABIERTO = "abierto"
    EN_ATENCION = "en_atencion"
    RESUELTO = "resuelto"
    CERRADO = "cerrado"
    ESCALADO = "escalado"


class Caso(Base):
    __tablename__ = "casos"

    id = Column(Integer, primary_key=True, index=True)
    
    # Referencias
    estudiante_id = Column(Integer, ForeignKey("estudiantes.id"), nullable=False)
    ticket_id = Column(Integer, ForeignKey("tickets.id"))
    
    # Tracking completo
    canal_origen = Column(String(50))
    categoria = Column(String(100))
    sintoma_inicial = Column(Text)
    
    # Etapas
    etapa_1_filtro = Column(String(100))  # Clasificación automática
    etapa_2_accion = Column(Text)  # Acción tomada
    etapa_3_escalado = Column(String(100))  # A quién se escaló
    
    # Estado y cierre
    estado = Column(Enum(CasoEstado), default=CasoEstado.ABIERTO)
    cierre_tipo = Column(String(50))
    estado_final = Column(String(50))
    
    # Evidencia
    evidencia_link = Column(String(1000))
    
    # Fechas
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())
    fecha_cierre = Column(DateTime(timezone=True))
    fecha_ultima_actualizacion = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relaciones
    estudiante = relationship("Estudiante")
    ticket = relationship("Ticket")
