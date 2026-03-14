from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from typing import Optional
from app.db.session import get_db
from app.models.bootcamp import Bootcamp, BootcampEstado
from app.models.estudiante import Estudiante, EstudianteEstado
from app.models.actividad import Actividad, ActividadEstado
from app.schemas.dashboard import DashboardMetrics, EstudianteEnRiesgo
from app.core.deps import require_student_success
from app.models.user import User

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardMetrics)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student_success)
):
    total_estudiantes = db.query(Estudiante).count()
    estudiantes_activos = db.query(Estudiante).filter(
        Estudiante.estado.in_([EstudianteEstado.ACTIVO, EstudianteEstado.NECESITA_SEGUIMIENTO])
    ).count()
    estudiantes_en_riesgo = db.query(Estudiante).filter(
        Estudiante.estado == EstudianteEstado.EN_RIESGO
    ).count()
    estudiantes_reactivados = db.query(Estudiante).filter(
        Estudiante.estado == EstudianteEstado.REACTIVADO
    ).count()
    
    total_abandonados = db.query(Estudiante).filter(
        Estudiante.estado == EstudianteEstado.ABANDONO
    ).count()
    total_graduados = db.query(Estudiante).filter(
        Estudiante.estado == EstudianteEstado.GRADUADO
    ).count()
    
    if total_estudiantes > 0:
        tasa_desercion = round((total_abandonados / total_estudiantes) * 100, 2)
    else:
        tasa_desercion = 0.0
    
    total_bootcamps = db.query(Bootcamp).count()
    bootcamps_activos = db.query(Bootcamp).filter(
        Bootcamp.estado == BootcampEstado.ACTIVO
    ).count()
    
    return DashboardMetrics(
        total_estudiantes=total_estudiantes,
        estudiantes_activos=estudiantes_activos,
        estudiantes_en_riesgo=estudiantes_en_riesgo,
        estudiantes_reactivados=estudiantes_reactivados,
        tasa_desercion=tasa_desercion,
        total_bootcamps=total_bootcamps,
        bootcamps_activos=bootcamps_activos
    )


@router.get("/riesgo", response_model=list[EstudianteEnRiesgo])
def get_estudiantes_en_riesgo(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student_success)
):
    estudiantes = db.query(Estudiante).filter(
        Estudiante.riesgo_desercion >= 30
    ).all()
    
    result = []
    for est in estudiantes:
        bootcamp = db.query(Bootcamp).filter(Bootcamp.id == est.bootcamp_id).first()
        ultimo_contacto_dias = 0
        if est.ultimo_contacto:
            ultimo_contacto = est.ultimo_contacto
            if ultimo_contacto.tzinfo is not None:
                ultimo_contacto = ultimo_contacto.replace(tzinfo=None)
            ultimo_contacto_dias = (datetime.now() - ultimo_contacto).days
        
        result.append(EstudianteEnRiesgo(
            id=est.id,
            nombre=est.nombre,
            apellido=est.apellido,
            email=est.email,
            bootcamp_nombre=bootcamp.nombre if bootcamp else "Sin bootcamp",
            riesgo_desercion=est.riesgo_desercion,
            ultimo_contacto_dias=ultimo_contacto_dias
        ))
    
    return sorted(result, key=lambda x: x.riesgo_desercion, reverse=True)


@router.get("/actividades-pendientes")
def get_actividades_pendientes(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student_success)
):
    actividades = db.query(Actividad).filter(
        Actividad.estado.in_([ActividadEstado.PENDIENTE, ActividadEstado.EN_PROGRESO])
    ).order_by(Actividad.fecha_limite.asc()).limit(20).all()
    
    result = []
    for act in actividades:
        estudiante = db.query(Estudiante).filter(Estudiante.id == act.estudiante_id).first()
        result.append({
            "id": act.id,
            "titulo": act.titulo,
            "estudiante_nombre": f"{estudiante.nombre} {estudiante.apellido}" if estudiante else "Sin estudiante",
            "fecha_limite": act.fecha_limite.isoformat() if act.fecha_limite else None,
            "estado": act.estado.value
        })
    
    return result
