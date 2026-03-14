from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.db.session import get_db
from app.models.estudiante import Estudiante, EstudianteEstado
from app.models.bootcamp import Bootcamp
from app.schemas.estudiante import EstudianteCreate, EstudianteUpdate, Estudiante, EstudianteWithRelations, EstudianteKanban
from app.core.deps import require_student_success, get_current_user
from app.models.user import User

router = APIRouter(prefix="/estudiantes", tags=["estudiantes"])


@router.get("", response_model=List[Estudiante])
def get_estudiantes(
    skip: int = 0,
    limit: int = 100,
    bootcamp_id: Optional[int] = None,
    estado: Optional[EstudianteEstado] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student_success)
):
    query = db.query(Estudiante)
    
    if bootcamp_id:
        query = query.filter(Estudiante.bootcamp_id == bootcamp_id)
    if estado:
        query = query.filter(Estudiante.estado == estado)
    
    return query.offset(skip).limit(limit).all()


@router.get("/kanban", response_model=dict)
def get_kanban(
    bootcamp_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student_success)
):
    query = db.query(Estudiante)
    if bootcamp_id:
        query = query.filter(Estudiante.bootcamp_id == bootcamp_id)
    
    estudiantes = query.all()
    
    columns = {estado.value: [] for estado in EstudianteEstado}
    
    for est in estudiantes:
        bootcamp = db.query(Bootcamp).filter(Bootcamp.id == est.bootcamp_id).first()
        ultimo_contacto_dias = None
        if est.ultimo_contacto:
            ultimo_contacto_dias = (datetime.now() - est.ultimo_contacto).days
        
        est_data = {
            "id": est.id,
            "nombre": est.nombre,
            "apellido": est.apellido,
            "email": est.email,
            "estado": est.estado.value,
            "riesgo_desercion": est.riesgo_desercion,
            "bootcamp_nombre": bootcamp.nombre if bootcamp else None,
            "ultimo_contacto_dias": ultimo_contacto_dias,
            "responsable_id": est.responsable_id
        }
        columns[est.estado.value].append(est_data)
    
    return columns


@router.get("/{estudiante_id}", response_model=EstudianteWithRelations)
def get_estudiante(
    estudiante_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student_success)
):
    estudiante = db.query(Estudiante).filter(Estudiante.id == estudiante_id).first()
    if not estudiante:
        raise HTTPException(status_code=404, detail="Estudiante not found")
    
    result = EstudianteWithRelations.model_validate(estudiante)
    if estudiante.bootcamp:
        result.bootcamp = {"id": estudiante.bootcamp.id, "nombre": estudiante.bootcamp.nombre}
    if estudiante.responsable:
        result.responsable = {"id": estudiante.responsable.id, "nombre": estudiante.responsable.nombre, "email": estudiante.responsable.email}
    
    return result


@router.post("", response_model=Estudiante)
def create_estudiante(
    estudiante_data: EstudianteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student_success)
):
    bootcamp = db.query(Bootcamp).filter(Bootcamp.id == estudiante_data.bootcamp_id).first()
    if not bootcamp:
        raise HTTPException(status_code=404, detail="Bootcamp not found")
    
    existing = db.query(Estudiante).filter(Estudiante.email == estudiante_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    estudiante = Estudiante(**estudiante_data.model_dump())
    if not estudiante.responsable_id:
        estudiante.responsable_id = current_user.id
    
    db.add(estudiante)
    db.commit()
    db.refresh(estudiante)
    return estudiante


@router.patch("/{estudiante_id}", response_model=Estudiante)
def update_estudiante(
    estudiante_id: int,
    estudiante_data: EstudianteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student_success)
):
    estudiante = db.query(Estudiante).filter(Estudiante.id == estudiante_id).first()
    if not estudiante:
        raise HTTPException(status_code=404, detail="Estudiante not found")
    
    for key, value in estudiante_data.model_dump(exclude_unset=True).items():
        setattr(estudiante, key, value)
    
    db.commit()
    db.refresh(estudiante)
    return estudiante


@router.patch("/{estudiante_id}/status", response_model=Estudiante)
def update_estudiante_status(
    estudiante_id: int,
    estado: EstudianteEstado,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student_success)
):
    estudiante = db.query(Estudiante).filter(Estudiante.id == estudiante_id).first()
    if not estudiante:
        raise HTTPException(status_code=404, detail="Estudiante not found")
    
    estudiante.estado = estado
    db.commit()
    db.refresh(estudiante)
    return estudiante


@router.delete("/{estudiante_id}")
def delete_estudiante(
    estudiante_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student_success)
):
    estudiante = db.query(Estudiante).filter(Estudiante.id == estudiante_id).first()
    if not estudiante:
        raise HTTPException(status_code=404, detail="Estudiante not found")
    
    db.delete(estudiante)
    db.commit()
    return {"message": "Estudiante deleted successfully"}
