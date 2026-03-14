from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.conversacion import Conversacion
from app.schemas.conversacion import ConversacionCreate, Conversacion
from app.core.deps import require_student_success, get_current_user
from app.models.user import User

router = APIRouter(prefix="/conversaciones", tags=["conversaciones"])


@router.get("", response_model=List[Conversacion])
def get_conversaciones(
    estudiante_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student_success)
):
    query = db.query(Conversacion)
    if estudiante_id:
        query = query.filter(Conversacion.estudiante_id == estudiante_id)
    return query.order_by(Conversacion.fecha.desc()).offset(skip).limit(limit).all()


@router.post("", response_model=Conversacion)
def create_conversacion(
    conversacion_data: ConversacionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student_success)
):
    from app.models.estudiante import Estudiante
    estudiante = db.query(Estudiante).filter(Estudiante.id == conversacion_data.estudiante_id).first()
    if not estudiante:
        raise HTTPException(status_code=404, detail="Estudiante not found")
    
    conversacion = Conversacion(**conversacion_data.model_dump())
    conversacion.usuario_id = current_user.id
    
    estudiante.ultimo_contacto = conversacion.fecha
    
    db.add(conversacion)
    db.commit()
    db.refresh(conversacion)
    return conversacion


@router.delete("/{conversacion_id}")
def delete_conversacion(
    conversacion_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student_success)
):
    conversacion = db.query(Conversacion).filter(Conversacion.id == conversacion_id).first()
    if not conversacion:
        raise HTTPException(status_code=404, detail="Conversacion not found")
    
    db.delete(conversacion)
    db.commit()
    return {"message": "Conversacion deleted successfully"}
