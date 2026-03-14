from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.bootcamp import Bootcamp
from app.models.estudiante import Estudiante, EstudianteEstado
from app.schemas.bootcamp import BootcampCreate, BootcampUpdate, Bootcamp, BootcampWithCount
from app.core.deps import require_admin, require_student_success
from app.models.user import User

router = APIRouter(prefix="/bootcamps", tags=["bootcamps"])


@router.get("", response_model=List[BootcampWithCount])
def get_bootcamps(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student_success)
):
    bootcamps = db.query(Bootcamp).all()
    result = []
    for bootcamp in bootcamps:
        bootcamp_data = BootcampWithCount.model_validate(bootcamp)
        bootcamp_data.total_estudiantes = db.query(Estudiante).filter(Estudiante.bootcamp_id == bootcamp.id).count()
        bootcamp_data.estudiantes_activos = db.query(Estudiante).filter(
            Estudiante.bootcamp_id == bootcamp.id,
            Estudiante.estado == EstudianteEstado.ACTIVO
        ).count()
        bootcamp_data.estudiantes_en_riesgo = db.query(Estudiante).filter(
            Estudiante.bootcamp_id == bootcamp.id,
            Estudiante.estado == EstudianteEstado.EN_RIESGO
        ).count()
        result.append(bootcamp_data)
    return result


@router.get("/{bootcamp_id}", response_model=Bootcamp)
def get_bootcamp(
    bootcamp_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student_success)
):
    bootcamp = db.query(Bootcamp).filter(Bootcamp.id == bootcamp_id).first()
    if not bootcamp:
        raise HTTPException(status_code=404, detail="Bootcamp not found")
    return bootcamp


@router.post("", response_model=Bootcamp)
def create_bootcamp(
    bootcamp_data: BootcampCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    bootcamp = Bootcamp(**bootcamp_data.model_dump())
    db.add(bootcamp)
    db.commit()
    db.refresh(bootcamp)
    return bootcamp


@router.put("/{bootcamp_id}", response_model=Bootcamp)
def update_bootcamp(
    bootcamp_id: int,
    bootcamp_data: BootcampUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    bootcamp = db.query(Bootcamp).filter(Bootcamp.id == bootcamp_id).first()
    if not bootcamp:
        raise HTTPException(status_code=404, detail="Bootcamp not found")
    
    for key, value in bootcamp_data.model_dump(exclude_unset=True).items():
        setattr(bootcamp, key, value)
    
    db.commit()
    db.refresh(bootcamp)
    return bootcamp


@router.delete("/{bootcamp_id}")
def delete_bootcamp(
    bootcamp_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    bootcamp = db.query(Bootcamp).filter(Bootcamp.id == bootcamp_id).first()
    if not bootcamp:
        raise HTTPException(status_code=404, detail="Bootcamp not found")
    
    db.delete(bootcamp)
    db.commit()
    return {"message": "Bootcamp deleted successfully"}
