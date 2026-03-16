from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.db.session import get_db
from app.models.bootcamp import Bootcamp, BootcampEstado
from app.models.estudiante import Estudiante, EstudianteEstado
from app.schemas.bootcamp import BootcampCreate, BootcampUpdate, BootcampSchema, BootcampWithCount
from app.core.deps import require_admin, require_student_success
from app.models.user import User
import openpyxl

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


@router.get("/{bootcamp_id}", response_model=BootcampSchema)
def get_bootcamp(
    bootcamp_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student_success)
):
    bootcamp = db.query(Bootcamp).filter(Bootcamp.id == bootcamp_id).first()
    if not bootcamp:
        raise HTTPException(status_code=404, detail="Bootcamp not found")
    return bootcamp


@router.post("", response_model=BootcampSchema)
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


@router.put("/{bootcamp_id}", response_model=BootcampSchema)
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
    
    # Primero borrar los estudiantes relacionados
    db.query(Estudiante).filter(Estudiante.bootcamp_id == bootcamp_id).delete()
    
    # Luego borrar el bootcamp
    db.delete(bootcamp)
    db.commit()
    return {"message": "Bootcamp deleted successfully"}


@router.post("/importar-excel")
def importar_bootcamp_excel(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student_success)
):
    wb = openpyxl.load_workbook(file.file)
    ws = wb.active
    
    headers = [cell.value for cell in ws[1]]
    
    codigo_idx = None
    email_idx = None
    nombre_est_idx = None
    apellido_idx = None
    telefono_idx = None
    whatsapp_idx = None
    ultimo_acceso_idx = None
    
    for i, h in enumerate(headers):
        h_lower = str(h).lower() if h else ""
        h_stripped = h_lower.strip() if h else ""
        
        # Código bootcamp - busca RTD- o cualquier cosa que parezca código
        if codigo_idx is None:
            if "rtd-" in h_lower or "codigo" in h_lower or "código" in h_lower:
                codigo_idx = i
            # Si es la primera columna y tiene formato de código
            elif i == 0 and h and ("-" in str(h) or len(str(h).strip()) > 5):
                codigo_idx = i
        
        # Nombre del estudiante - "Nombre" sin "bootcamp"
        if nombre_est_idx is None:
            if h_stripped == "nombre":
                nombre_est_idx = i
            elif "nombre" in h_lower and "bootcamp" not in h_lower and "apellido" not in h_lower:
                nombre_est_idx = i
        
        # Email - "Dirección de correo" o "Email"
        if email_idx is None:
            if "correo" in h_lower or "email" in h_lower:
                email_idx = i
        
        # Apellido - "Apellido(s)"
        if apellido_idx is None:
            if "apellido" in h_lower:
                apellido_idx = i
        
        # Teléfono - "Teléfono"
        if telefono_idx is None:
            if "telefono" in h_lower or "teléfono" in h_lower:
                telefono_idx = i
        
        # WhatsApp - "WhatsApp"
        if whatsapp_idx is None:
            if "whatsapp" in h_lower or "whats" in h_lower:
                whatsapp_idx = i
        
        # Último acceso - "Último acceso al curso"
        if ultimo_acceso_idx is None:
            if "último acceso" in h_lower or "ultimo acceso" in h_lower or "last access" in h_lower:
                ultimo_acceso_idx = i
    
    # Debug: mostrar qué columnas se detectaron
    print(f"DEBUG - Columnas detectadas:")
    print(f"  codigo_idx: {codigo_idx} -> {headers[codigo_idx] if codigo_idx else 'NO ENCONTRADO'}")
    print(f"  nombre_est_idx: {nombre_est_idx} -> {headers[nombre_est_idx] if nombre_est_idx else 'NO ENCONTRADO'}")
    print(f"  email_idx: {email_idx} -> {headers[email_idx] if email_idx else 'NO ENCONTRADO'}")
    print(f"  apellido_idx: {apellido_idx} -> {headers[apellido_idx] if apellido_idx else 'NO ENCONTRADO'}")
    print(f"  telefono_idx: {telefono_idx} -> {headers[telefono_idx] if telefono_idx else 'NO ENCONTRADO'}")
    print(f"  whatsapp_idx: {whatsapp_idx} -> {headers[whatsapp_idx] if whatsapp_idx else 'NO ENCONTRADO'}")
    print(f"  ultimo_acceso_idx: {ultimo_acceso_idx} -> {headers[ultimo_acceso_idx] if ultimo_acceso_idx else 'NO ENCONTRADO'}")
    
    if codigo_idx is None:
        raise HTTPException(status_code=400, detail=f"No se encontró el código del bootcamp. Headers: {headers}")
    
    first_row = ws.iter_rows(min_row=2, max_row=2, values_only=True).__next__()
    codigo_bootcamp = str(first_row[codigo_idx]).strip() if first_row[codigo_idx] else None
    
    if not codigo_bootcamp:
        raise HTTPException(status_code=400, detail="El código del bootcamp no puede estar vacío")
    
    bootcamp = db.query(Bootcamp).filter(Bootcamp.codigo == codigo_bootcamp).first()
    if bootcamp:
        return {
            "message": "El bootcamp ya existe",
            "bootcamp": BootcampSchema.model_validate(bootcamp),
            "estudiantes_existentes": db.query(Estudiante).filter(Estudiante.bootcamp_id == bootcamp.id).count()
        }
    
    nombre_bootcamp = codigo_bootcamp  # Usamos el código como nombre del bootcamp
    
    bootcamp = Bootcamp(
        codigo=codigo_bootcamp,
        nombre=str(nombre_bootcamp),
        estado=BootcampEstado.ACTIVO
    )
    db.add(bootcamp)
    db.commit()
    db.refresh(bootcamp)
    
    if email_idx is None:
        return {
            "message": "Bootcamp creado sin estudiantes (no se encontró columna de email)",
            "bootcamp": BootcampSchema.model_validate(bootcamp),
            "estudiantes_creados": 0
        }
    
    if nombre_est_idx is None:
        raise HTTPException(status_code=400, detail="No se encontró columna de nombre del estudiante")
    
    creados = 0
    errores = []
    
    for row in ws.iter_rows(min_row=2, values_only=True):
        if not row[email_idx]:
            continue
        
        try:
            email = str(row[email_idx]).strip().lower()
            nombre = str(row[nombre_est_idx]).strip() if nombre_est_idx and row[nombre_est_idx] else ""
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
                errores.append(f"{email}: ya existe")
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
        except Exception as e:
            errores.append(f"Error en fila: {str(e)}")
    
    db.commit()
    
    return {
        "message": f"Bootcamp '{bootcamp.nombre}' creado con {creados} estudiantes",
        "bootcamp": BootcampSchema.model_validate(bootcamp),
        "estudiantes_creados": creados,
        "errores": errores[:10]
    }
