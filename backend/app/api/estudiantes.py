from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.db.session import get_db
from app.models.estudiante import Estudiante, EstudianteEstado
from app.models.bootcamp import Bootcamp
from app.schemas.estudiante import EstudianteCreate, EstudianteUpdate, EstudianteSchema, EstudianteWithRelations, EstudianteKanban
from app.core.deps import require_student_success, get_current_user
from app.models.user import User
import openpyxl

router = APIRouter(prefix="/estudiantes", tags=["estudiantes"])


@router.get("", response_model=List[EstudianteSchema])
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
    
    estudiantes = query.offset(skip).limit(limit).all()
    
    result = []
    for est in estudiantes:
        bootcamp = db.query(Bootcamp).filter(Bootcamp.id == est.bootcamp_id).first()
        est_dict = {
            "nombre": est.nombre,
            "apellido": est.apellido,
            "email": est.email,
            "telefono": est.telefono,
            "whatsapp": est.whatsapp,
            "bootcamp_id": est.bootcamp_id,
            "estado": est.estado,
            "responsable_id": est.responsable_id,
            "id": est.id,
            "riesgo_desercion": est.riesgo_desercion,
            "fecha_ingreso": est.fecha_ingreso,
            "ultimo_contacto": est.ultimo_contacto,
            "created_at": est.created_at,
            "bootcamp_nombre": bootcamp.nombre if bootcamp else None
        }
        result.append(est_dict)
    
    return result


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
            ultimo_contacto = est.ultimo_contacto
            if ultimo_contacto.tzinfo is not None:
                ultimo_contacto = ultimo_contacto.replace(tzinfo=None)
            ultimo_contacto_dias = (datetime.now() - ultimo_contacto).days
        
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


@router.post("", response_model=EstudianteSchema)
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


@router.patch("/{estudiante_id}", response_model=EstudianteSchema)
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


@router.patch("/{estudiante_id}/status", response_model=EstudianteSchema)
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


@router.post("/importar-excel")
def importar_estudiantes_excel(
    bootcamp_codigo: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student_success)
):
    bootcamp = db.query(Bootcamp).filter(Bootcamp.codigo == bootcamp_codigo).first()
    if not bootcamp:
        raise HTTPException(status_code=404, detail="Bootcamp no encontrado")
    
    wb = openpyxl.load_workbook(file.file)
    ws = wb.active
    
    headers = [cell.value for cell in ws[1]]
    
    email_idx = None
    nombre_idx = None
    apellido_idx = None
    telefono_idx = None
    whatsapp_idx = None
    ultimo_acceso_idx = None
    
    for i, h in enumerate(headers):
        h_lower = str(h).lower() if h else ""
        if "email" in h_lower or "correo" in h_lower:
            email_idx = i
        elif "nombre" in h_lower and "apellido" not in h_lower:
            nombre_idx = i
        elif "apellido" in h_lower:
            apellido_idx = i
        elif "telefono" in h_lower:
            telefono_idx = i
        elif "whatsapp" in h_lower or "whats" in h_lower:
            whatsapp_idx = i
        elif "último acceso" in h_lower or "ultimo acceso" in h_lower or "last access" in h_lower:
            ultimo_acceso_idx = i
    
    if email_idx is None or nombre_idx is None:
        raise HTTPException(status_code=400, detail="El Excel debe tener columnas de email y nombre")
    
    creados = 0
    errores = []
    
    from datetime import datetime
    
    for row in ws.iter_rows(min_row=2, values_only=True):
        if not row[email_idx]:
            continue
        
        email = str(row[email_idx]).strip().lower()
        nombre = str(row[nombre_idx]).strip() if nombre_idx and row[nombre_idx] else ""
        apellido = str(row[apellido_idx]).strip() if apellido_idx and row[apellido_idx] else ""
        telefono = str(row[telefono_idx]).strip() if telefono_idx and row[telefono_idx] else ""
        whatsapp = str(row[whatsapp_idx]).strip() if whatsapp_idx and row[whatsapp_idx] else ""
        
        ultimo_acceso_moodle = None
        if ultimo_acceso_idx and row[ultimo_acceso_idx]:
            try:
                valor = row[ultimo_acceso_idx]
                if isinstance(valor, datetime):
                    ultimo_acceso_moodle = valor
                elif isinstance(valor, str):
                    for fmt in ["%Y-%m-%d %H:%M:%S", "%d/%m/%Y %H:%M:%S", "%d/%m/%Y", "%Y-%m-%d"]:
                        try:
                            ultimo_acceso_moodle = datetime.strptime(valor.strip(), fmt)
                            break
                        except:
                            pass
            except:
                pass
        
        existing = db.query(Estudiante).filter(Estudiante.email == email).first()
        if existing:
            if ultimo_acceso_moodle:
                existing.ultimo_acceso_moodle = ultimo_acceso_moodle
            errores.append(f"{email}: actualizado")
            continue
        
        estudiante = Estudiante(
            email=email,
            nombre=nombre,
            apellido=apellido,
            telefono=telefono or None,
            whatsapp=whatsapp or None,
            bootcamp_id=bootcamp.id,
            estado=EstudianteEstado.NUEVO,
            responsable_id=current_user.id,
            ultimo_acceso_moodle=ultimo_acceso_moodle
        )
        db.add(estudiante)
        creados += 1
    
    db.commit()
    
    return {
        "message": f"Se importaron {creados} estudiantes",
        "errores": errores[:10],
        "bootcamp_id": bootcamp.id,
        "bootcamp_codigo": bootcamp.codigo
    }
