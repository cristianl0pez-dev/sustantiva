from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.nota import Nota
from app.schemas.nota import NotaCreate, Nota
from app.core.deps import require_student_success, get_current_user
from app.models.user import User

router = APIRouter(prefix="/notas", tags=["notas"])


@router.get("", response_model=List[Nota])
def get_notas(
    estudiante_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student_success)
):
    query = db.query(Nota)
    if estudiante_id:
        query = query.filter(Nota.estudiante_id == estudiante_id)
    return query.order_by(Nota.fecha.desc()).offset(skip).limit(limit).all()


@router.post("", response_model=Nota)
def create_nota(
    nota_data: NotaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student_success)
):
    from app.models.estudiante import Estudiante
    estudiante = db.query(Estudiante).filter(Estudiante.id == nota_data.estudiante_id).first()
    if not estudiante:
        raise HTTPException(status_code=404, detail="Estudiante not found")
    
    nota = Nota(**nota_data.model_dump())
    nota.autor_id = current_user.id
    
    db.add(nota)
    db.commit()
    db.refresh(nota)
    return nota


@router.delete("/{nota_id}")
def delete_nota(
    nota_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student_success)
):
    nota = db.query(Nota).filter(Nota.id == nota_id).first()
    if not nota:
        raise HTTPException(status_code=404, detail="Nota not found")
    
    if nota.autor_id != current_user.id and current_user.rol.value != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this note")
    
    db.delete(nota)
    db.commit()
    return {"message": "Nota deleted successfully"}
