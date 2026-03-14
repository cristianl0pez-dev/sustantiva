from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.actividad import Actividad, ActividadEstado
from app.schemas.actividad import ActividadCreate, ActividadUpdate, Actividad
from app.core.deps import require_student_success, get_current_user
from app.models.user import User

router = APIRouter(prefix="/actividades", tags=["actividades"])


@router.get("", response_model=List[Actividad])
def get_actividades(
    estudiante_id: Optional[int] = None,
    estado: Optional[ActividadEstado] = None,
    responsable_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student_success)
):
    query = db.query(Actividad)
    if estudiante_id:
        query = query.filter(Actividad.estudiante_id == estudiante_id)
    if estado:
        query = query.filter(Actividad.estado == estado)
    if responsable_id:
        query = query.filter(Actividad.responsable_id == responsable_id)
    return query.order_by(Actividad.fecha_limite.asc()).offset(skip).limit(limit).all()


@router.post("", response_model=Actividad)
def create_actividad(
    actividad_data: ActividadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student_success)
):
    from app.models.estudiante import Estudiante
    estudiante = db.query(Estudiante).filter(Estudiante.id == actividad_data.estudiante_id).first()
    if not estudiante:
        raise HTTPException(status_code=404, detail="Estudiante not found")
    
    actividad = Actividad(**actividad_data.model_dump())
    if not actividad.responsable_id:
        actividad.responsable_id = current_user.id
    
    db.add(actividad)
    db.commit()
    db.refresh(actividad)
    return actividad


@router.patch("/{actividad_id}", response_model=Actividad)
def update_actividad(
    actividad_id: int,
    actividad_data: ActividadUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student_success)
):
    actividad = db.query(Actividad).filter(Actividad.id == actividad_id).first()
    if not actividad:
        raise HTTPException(status_code=404, detail="Actividad not found")
    
    for key, value in actividad_data.model_dump(exclude_unset=True).items():
        setattr(actividad, key, value)
    
    db.commit()
    db.refresh(actividad)
    return actividad


@router.delete("/{actividad_id}")
def delete_actividad(
    actividad_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student_success)
):
    actividad = db.query(Actividad).filter(Actividad.id == actividad_id).first()
    if not actividad:
        raise HTTPException(status_code=404, detail="Actividad not found")
    
    db.delete(actividad)
    db.commit()
    return {"message": "Actividad deleted successfully"}
