from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, timezone
from typing import Optional, List

from app.db.session import get_db
from app.models.config_riesgo import ConfiguracionRiesgo
from app.models.estudiante import Estudiante, EstudianteEstado
from app.models.ticket import Ticket, TicketTipo, TicketPrioridad, TicketEstado
from app.models.user import User
from app.core.deps import require_student_success

router = APIRouter(prefix="/config/riesgo", tags=["config-riesgo"])


class ConfigRiesgoBase(BaseModel):
    umbral_riesgo: int = 60
    dias_sin_moodle: int = 7
    dias_sin_contacto: int = 14


class ConfigRiesgoResponse(ConfigRiesgoBase):
    id: int
    ultima_ejecucion: Optional[datetime] = None
    estudiantes_evaluados: int = 0
    tickets_creados: int = 0

    class Config:
        from_attributes = True


class EvaluacionResponse(BaseModel):
    estudiantes_evaluados: int
    tickets_creados: int
    detalle: List[dict]


def get_or_create_config(db: Session) -> ConfiguracionRiesgo:
    config = db.query(ConfiguracionRiesgo).first()
    if not config:
        config = ConfiguracionRiesgo()
        db.add(config)
        db.commit()
        db.refresh(config)
    return config


@router.get("", response_model=ConfigRiesgoResponse)
def get_config_riesgo(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student_success)
):
    return get_or_create_config(db)


@router.put("", response_model=ConfigRiesgoResponse)
def update_config_riesgo(
    config_data: ConfigRiesgoBase,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student_success)
):
    config = get_or_create_config(db)
    config.umbral_riesgo = config_data.umbral_riesgo
    config.dias_sin_moodle = config_data.dias_sin_moodle
    config.dias_sin_contacto = config_data.dias_sin_contacto
    db.commit()
    db.refresh(config)
    return config


@router.post("/evaluar", response_model=EvaluacionResponse)
def evaluar_riesgo(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student_success)
):
    config = get_or_create_config(db)
    
    estudiantes = db.query(Estudiante).all()
    tickets_creados = 0
    detalle = []
    hoy = datetime.now(timezone.utc)
    
    for est in estudiantes:
        dias_moodle = None
        if est.ultimo_acceso_moodle:
            diff = hoy - est.ultimo_acceso_moodle
            dias_moodle = diff.days
        
        dias_contacto = None
        if est.ultimo_contacto:
            diff = hoy - est.ultimo_contacto
            dias_contacto = diff.days
        
        riesgo = 0
        
        if dias_moodle is not None:
            if dias_moodle >= config.dias_sin_moodle:
                riesgo = max(riesgo, 50 + min(20, (dias_moodle - config.dias_sin_moodle) * 3))
        
        if dias_contacto is not None:
            if dias_contacto >= config.dias_sin_contacto:
                riesgo = max(riesgo, 50 + min(20, (dias_contacto - config.dias_sin_contacto) * 3))
        
        if est.estado == EstudianteEstado.EN_RIESGO:
            riesgo = max(riesgo, 70)
        elif est.estado == EstudianteEstado.NECESITA_SEGUIMIENTO:
            riesgo = max(riesgo, 40)
        
        est.riesgo_desercion = min(riesgo, 100)
        
        if riesgo >= config.umbral_riesgo:
            ticket_existente = db.query(Ticket).filter(
                Ticket.estudiante_id == est.id
            ).order_by(Ticket.fecha_creacion.desc()).first()
            
            skip_ticket = False
            if ticket_existente:
                if ticket_existente.estado in [TicketEstado.ABIERTO, TicketEstado.EN_PROCESO, TicketEstado.ESPERA]:
                    skip_ticket = True
                elif ticket_existente.fecha_creacion and (hoy - ticket_existente.fecha_creacion).days < 7:
                    skip_ticket = True
            
            if not skip_ticket:
                if riesgo >= 80:
                    prioridad = TicketPrioridad.URGENTE
                elif riesgo >= 70:
                    prioridad = TicketPrioridad.ALTA
                elif riesgo >= 60:
                    prioridad = TicketPrioridad.MEDIA
                else:
                    prioridad = TicketPrioridad.BAJA
                
                ticket = Ticket(
                    estudiante_id=est.id,
                    tipo=TicketTipo.ASISTENCIA,
                    titulo=f"Alerta de riesgo de deserción - {est.nombre} {est.apellido}",
                    descripcion=f"Estudiante en riesgo de deserción ({riesgo}%)\n\n"
                              f"Días sin acceso Moodle: {dias_moodle if dias_moodle else 'N/A'}\n"
                              f"Días sin contacto: {dias_contacto if dias_contacto else 'N/A'}\n"
                              f"Estado actual: {est.estado.value}",
                    prioridad=prioridad,
                    asignado_a_id=est.responsable_id
                )
                db.add(ticket)
                tickets_creados += 1
                detalle.append({
                    "estudiante_id": est.id,
                    "nombre": f"{est.nombre} {est.apellido}",
                    "riesgo": riesgo
                })
    
    config.ultima_ejecucion = hoy
    config.estudiantes_evaluados = len(estudiantes)
    config.tickets_creados = tickets_creados
    db.commit()
    
    return {
        "estudiantes_evaluados": len(estudiantes),
        "tickets_creados": tickets_creados,
        "detalle": detalle
    }
