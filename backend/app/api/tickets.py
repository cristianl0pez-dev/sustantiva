from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.db.session import get_db
from app.models.ticket import (
    Ticket, Interaccion, Caso, TicketTipo, TicketEstado, TicketNivel, 
    TicketPrioridad, InteraccionTipo, CasoEstado
)
from app.models.estudiante import Estudiante
from app.schemas.ticket import (
    TicketCreate, TicketUpdate, TicketSchema, TicketListSchema,
    TicketAsignar, TicketCerrar, TicketAsignarNivel, TicketEscalar,
    InteraccionCreate, InteraccionSchema, CasoCreate, CasoUpdate, CasoSchema,
    TicketDashboard, TicketOpciones
)
from app.core.deps import require_student_success, get_current_user
from app.models.user import User

router = APIRouter(prefix="/tickets", tags=["tickets"])


def clasificar_nivel(tipo: TicketTipo) -> TicketNivel:
    """Clasifica automáticamente el nivel según el tipo de ticket"""
    nivel_1_tipos = [
        TicketTipo.ENLACE_CLASE,
        TicketTipo.MATERIALES,
    ]
    nivel_2_tipos = [
        TicketTipo.TECNICO,
        TicketTipo.TAREA_FEEDBACK,
    ]
    nivel_3_tipos = [
        TicketTipo.EVALUACION,
        TicketTipo.ASISTENCIA,
        TicketTipo.CERTIFICACION,
        TicketTipo.SUBSIDIO,
    ]
    
    if tipo in nivel_1_tipos:
        return TicketNivel.NIVEL_1
    elif tipo in nivel_2_tipos:
        return TicketNivel.NIVEL_2
    elif tipo in nivel_3_tipos:
        return TicketNivel.NIVEL_3
    else:
        return TicketNivel.NIVEL_2


def get_respuesta_automatica(tipo: TicketTipo) -> Optional[str]:
    """Retorna respuesta automática según el tipo de ticket"""
    respuestas = {
        TicketTipo.ENLACE_CLASE: "Los enlaces de clase se envían automáticamente 15 minutos antes de cada sesión. Por favor revisa tu correo electrónico o la plataforma virtual.",
        TicketTipo.MATERIALES: "Los materiales de clase están disponibles en la plataforma virtual. Si no puedes acceder, por favor indica qué material necesitas específicamente.",
        TicketTipo.ACCESO: "Para problemas de acceso, por favor proporciona tu correo electrónico y el mensaje de error que estás viendo.",
    }
    return respuestas.get(tipo)


@router.get("", response_model=List[TicketListSchema])
def get_tickets(
    skip: int = 0,
    limit: int = 50,
    estado: Optional[TicketEstado] = None,
    tipo: Optional[TicketTipo] = None,
    prioridad: Optional[TicketPrioridad] = None,
    nivel: Optional[TicketNivel] = None,
    estudiante_id: Optional[int] = None,
    asignado_a_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student_success)
):
    query = db.query(Ticket)
    
    if estado:
        query = query.filter(Ticket.estado == estado)
    if tipo:
        query = query.filter(Ticket.tipo == tipo)
    if prioridad:
        query = query.filter(Ticket.prioridad == prioridad)
    if nivel:
        query = query.filter(Ticket.nivel == nivel)
    if estudiante_id:
        query = query.filter(Ticket.estudiante_id == estudiante_id)
    if asignado_a_id:
        query = query.filter(Ticket.asignado_a_id == asignado_a_id)
    
    tickets = query.order_by(Ticket.fecha_creacion.desc()).offset(skip).limit(limit).all()
    
    result = []
    for t in tickets:
        ticket_dict = {
            "id": t.id,
            "estudiante_id": t.estudiante_id,
            "tipo": t.tipo,
            "titulo": t.titulo,
            "estado": t.estado,
            "prioridad": t.prioridad,
            "nivel": t.nivel,
            "fecha_creacion": t.fecha_creacion,
            "fecha_ultima_actualizacion": t.fecha_ultima_actualizacion,
            "estudiante": {
                "id": t.estudiante.id,
                "nombre": t.estudiante.nombre,
                "apellido": t.estudiante.apellido,
                "email": t.estudiante.email,
            } if t.estudiante else None,
            "asignado_a": {
                "id": t.asignado_a.id,
                "nombre": t.asignado_a.nombre,
                "email": t.asignado_a.email,
            } if t.asignado_a else None,
        }
        result.append(ticket_dict)
    
    return result


@router.get("/opciones", response_model=TicketOpciones)
def get_opciones(db: Session = Depends(get_db)):
    return {}


@router.get("/dashboard", response_model=TicketDashboard)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student_success)
):
    tickets = db.query(Ticket).all()
    
    tickets_por_tipo = {}
    tickets_por_prioridad = {}
    tickets_por_nivel = {}
    
    for t in tickets:
        # Por tipo
        tipo_key = t.tipo.value if t.tipo else "sin_tipo"
        tickets_por_tipo[tipo_key] = tickets_por_tipo.get(tipo_key, 0) + 1
        
        # Por prioridad
        prio_key = t.prioridad.value if t.prioridad else "sin_prioridad"
        tickets_por_prioridad[prio_key] = tickets_por_prioridad.get(prio_key, 0) + 1
        
        # Por nivel
        nivel_key = t.nivel.value if t.nivel else "sin_nivel"
        tickets_por_nivel[nivel_key] = tickets_por_nivel.get(nivel_key, 0) + 1
    
    return {
        "total_tickets": len(tickets),
        "tickets_abiertos": len([t for t in tickets if t.estado == TicketEstado.ABIERTO]),
        "tickets_en_proceso": len([t for t in tickets if t.estado == TicketEstado.EN_PROCESO]),
        "tickets_resueltos": len([t for t in tickets if t.estado == TicketEstado.RESUELTO]),
        "tickets_cerrados": len([t for t in tickets if t.estado == TicketEstado.CERRADO]),
        "tickets_urgentes": len([t for t in tickets if t.prioridad == TicketPrioridad.URGENTE]),
        "tickets_por_tipo": tickets_por_tipo,
        "tickets_por_prioridad": tickets_por_prioridad,
        "tickets_por_nivel": tickets_por_nivel,
    }


@router.get("/{ticket_id}", response_model=TicketSchema)
def get_ticket(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student_success)
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")
    
    interacciones = db.query(Interaccion).filter(
        Interaccion.ticket_id == ticket_id
    ).order_by(Interaccion.created_at.desc()).all()
    
    return {
        "id": ticket.id,
        "estudiante_id": ticket.estudiante_id,
        "tipo": ticket.tipo,
        "titulo": ticket.titulo,
        "descripcion": ticket.descripcion,
        "estado": ticket.estado,
        "prioridad": ticket.prioridad,
        "nivel": ticket.nivel,
        "fecha_creacion": ticket.fecha_creacion,
        "fecha_cierre": ticket.fecha_cierre,
        "fecha_ultima_actualizacion": ticket.fecha_ultima_actualizacion,
        "resolucion": ticket.resolucion,
        "cierre_tipo": ticket.cierre_tipo,
        "asignado_a_id": ticket.asignado_a_id,
        "etiquetas": ticket.etiquetas,
        "canal_origen": ticket.canal_origen,
        "evidencia_link": ticket.evidencia_link,
        "obs_tecnica": ticket.obs_tecnica,
        "estudiante": {
            "id": ticket.estudiante.id,
            "nombre": ticket.estudiante.nombre,
            "apellido": ticket.estudiante.apellido,
            "email": ticket.estudiante.email,
        } if ticket.estudiante else None,
        "asignado_a": {
            "id": ticket.asignado_a.id,
            "nombre": ticket.asignado_a.nombre,
            "email": ticket.asignado_a.email,
        } if ticket.asignado_a else None,
        "interacciones": [
            {
                "id": i.id,
                "ticket_id": i.ticket_id,
                "usuario_id": i.usuario_id,
                "tipo": i.tipo,
                "contenido": i.contenido,
                "canal": i.canal,
                "es_automatica": i.es_automatica,
                "created_at": i.created_at,
            }
            for i in interacciones
        ],
    }


@router.post("", response_model=TicketSchema)
def create_ticket(
    ticket_data: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student_success)
):
    # Verificar que el estudiante existe
    estudiante = db.query(Estudiante).filter(Estudiante.id == ticket_data.estudiante_id).first()
    if not estudiante:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")
    
    # Clasificar nivel automáticamente
    nivel = clasificar_nivel(ticket_data.tipo)
    
    # Crear ticket
    ticket = Ticket(
        estudiante_id=ticket_data.estudiante_id,
        tipo=ticket_data.tipo,
        titulo=ticket_data.titulo,
        descripcion=ticket_data.descripcion,
        prioridad=ticket_data.prioridad,
        nivel=nivel,
        canal_origen=ticket_data.canal_origen,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    
    # Crear interacción inicial
    interaccion = Interaccion(
        ticket_id=ticket.id,
        usuario_id=current_user.id,
        tipo=InteraccionTipo.MENSAJE_ENTRANTE,
        contenido=f"Ticket creado: {ticket_data.descripcion}",
        canal=ticket_data.canal_origen,
    )
    db.add(interaccion)
    
    # Respuesta automática para nivel 1
    if nivel == TicketNivel.NIVEL_1:
        respuesta = get_respuesta_automatica(ticket_data.tipo)
        if respuesta:
            interaccion_auto = Interaccion(
                ticket_id=ticket.id,
                tipo=InteraccionTipo.RESPUESTA_AUTOMATICA,
                contenido=respuesta,
                canal="web",
                es_automatica=True,
            )
            db.add(interaccion_auto)
    
    db.commit()
    
    return {
        "id": ticket.id,
        "estudiante_id": ticket.estudiante_id,
        "tipo": ticket.tipo,
        "titulo": ticket.titulo,
        "descripcion": ticket.descripcion,
        "estado": ticket.estado,
        "prioridad": ticket.prioridad,
        "nivel": ticket.nivel,
        "fecha_creacion": ticket.fecha_creacion,
        "fecha_cierre": ticket.fecha_cierre,
        "fecha_ultima_actualizacion": ticket.fecha_ultima_actualizacion,
        "resolucion": ticket.resolucion,
        "cierre_tipo": ticket.cierre_tipo,
        "asignado_a_id": ticket.asignado_a_id,
        "etiquetas": ticket.etiquetas,
        "canal_origen": ticket.canal_origen,
        "evidencia_link": ticket.evidencia_link,
        "obs_tecnica": ticket.obs_tecnica,
        "estudiante": {
            "id": estudiante.id,
            "nombre": estudiante.nombre,
            "apellido": estudiante.apellido,
            "email": estudiante.email,
        },
        "asignado_a": None,
        "interacciones": [],
    }


@router.patch("/{ticket_id}", response_model=TicketSchema)
def update_ticket(
    ticket_id: int,
    ticket_data: TicketUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student_success)
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")
    
    # Guardar estado anterior para registrar cambio
    estado_anterior = ticket.estado
    
    # Actualizar campos
    update_data = ticket_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(ticket, field, value)
    
    # Registrar cambio de estado
    if ticket_data.estado and ticket_data.estado != estado_anterior:
        interaccion = Interaccion(
            ticket_id=ticket.id,
            usuario_id=current_user.id,
            tipo=InteraccionTipo.CAMBIO_ESTADO,
            contenido=f"Estado cambiado de {estado_anterior.value} a {ticket_data.estado.value}",
        )
        db.add(interaccion)
    
    db.commit()
    db.refresh(ticket)
    
    return {
        "id": ticket.id,
        "estudiante_id": ticket.estudiante_id,
        "tipo": ticket.tipo,
        "titulo": ticket.titulo,
        "descripcion": ticket.descripcion,
        "estado": ticket.estado,
        "prioridad": ticket.prioridad,
        "nivel": ticket.nivel,
        "fecha_creacion": ticket.fecha_creacion,
        "fecha_cierre": ticket.fecha_cierre,
        "fecha_ultima_actualizacion": ticket.fecha_ultima_actualizacion,
        "resolucion": ticket.resolucion,
        "cierre_tipo": ticket.cierre_tipo,
        "asignado_a_id": ticket.asignado_a_id,
        "etiquetas": ticket.etiquetas,
        "canal_origen": ticket.canal_origen,
        "evidencia_link": ticket.evidencia_link,
        "obs_tecnica": ticket.obs_tecnica,
    }


@router.post("/{ticket_id}/asignar", response_model=TicketSchema)
def asignar_ticket(
    ticket_id: int,
    data: TicketAsignar,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student_success)
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")
    
    ticket.asignado_a_id = data.asignado_a_id
    
    interaccion = Interaccion(
        ticket_id=ticket.id,
        usuario_id=current_user.id,
        tipo=InteraccionTipo.ASIGNACION,
        contenido=f"Ticket asignado al usuario ID: {data.asignado_a_id}",
    )
    db.add(interaccion)
    
    db.commit()
    db.refresh(ticket)
    
    return {
        "id": ticket.id,
        "estudiante_id": ticket.estudiante_id,
        "tipo": ticket.tipo,
        "titulo": ticket.titulo,
        "descripcion": ticket.descripcion,
        "estado": ticket.estado,
        "prioridad": ticket.prioridad,
        "nivel": ticket.nivel,
        "fecha_creacion": ticket.fecha_creacion,
        "fecha_cierre": ticket.fecha_cierre,
        "fecha_ultima_actualizacion": ticket.fecha_ultima_actualizacion,
        "resolucion": ticket.resolucion,
        "cierre_tipo": ticket.cierre_tipo,
        "asignado_a_id": ticket.asignado_a_id,
        "etiquetas": ticket.etiquetas,
        "canal_origen": ticket.canal_origen,
        "evidencia_link": ticket.evidencia_link,
        "obs_tecnica": ticket.obs_tecnica,
    }


@router.post("/{ticket_id}/cerrar", response_model=TicketSchema)
def cerrar_ticket(
    ticket_id: int,
    data: TicketCerrar,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student_success)
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")
    
    ticket.estado = TicketEstado.RESUELTO
    ticket.fecha_cierre = datetime.now(timezone.utc)
    ticket.resolucion = data.resolucion
    ticket.cierre_tipo = data.cierre_tipo
    
    interaccion = Interaccion(
        ticket_id=ticket.id,
        usuario_id=current_user.id,
        tipo=InteraccionTipo.CAMBIO_ESTADO,
        contenido=f"Ticket resuelto: {data.resolucion}",
    )
    db.add(interaccion)
    
    db.commit()
    db.refresh(ticket)
    
    return {
        "id": ticket.id,
        "estudiante_id": ticket.estudiante_id,
        "tipo": ticket.tipo,
        "titulo": ticket.titulo,
        "descripcion": ticket.descripcion,
        "estado": ticket.estado,
        "prioridad": ticket.prioridad,
        "nivel": ticket.nivel,
        "fecha_creacion": ticket.fecha_creacion,
        "fecha_cierre": ticket.fecha_cierre,
        "fecha_ultima_actualizacion": ticket.fecha_ultima_actualizacion,
        "resolucion": ticket.resolucion,
        "cierre_tipo": ticket.cierre_tipo,
        "asignado_a_id": ticket.asignado_a_id,
        "etiquetas": ticket.etiquetas,
        "canal_origen": ticket.canal_origen,
        "evidencia_link": ticket.evidencia_link,
        "obs_tecnica": ticket.obs_tecnica,
    }


@router.post("/{ticket_id}/interacciones", response_model=InteraccionSchema)
def create_interaccion(
    ticket_id: int,
    data: InteraccionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student_success)
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket no encontrado")
    
    interaccion = Interaccion(
        ticket_id=ticket_id,
        usuario_id=current_user.id,
        tipo=data.tipo,
        contenido=data.contenido,
        canal=data.canal,
        es_automatica=data.es_automatica,
    )
    db.add(interaccion)
    
    # Actualizar estado del ticket si es mensaje entrante
    if data.tipo == InteraccionTipo.MENSAJE_ENTRANTE and ticket.estado == TicketEstado.ABIERTO:
        ticket.estado = TicketEstado.EN_PROCESO
    
    db.commit()
    db.refresh(interaccion)
    
    return interaccion


@router.get("/{ticket_id}/interacciones", response_model=List[InteraccionSchema])
def get_interacciones(
    ticket_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student_success)
):
    interacciones = db.query(Interaccion).filter(
        Interaccion.ticket_id == ticket_id
    ).order_by(Interaccion.created_at.desc()).all()
    return interacciones


# Endpoints de Casos
@router.get("/casos", response_model=List[CasoSchema])
def get_casos(
    skip: int = 0,
    limit: int = 50,
    estado: Optional[CasoEstado] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student_success)
):
    query = db.query(Caso)
    if estado:
        query = query.filter(Caso.estado == estado)
    
    casos = query.order_by(Caso.fecha_creacion.desc()).offset(skip).limit(limit).all()
    return casos


@router.get("/casos/{caso_id}", response_model=CasoSchema)
def get_caso(
    caso_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student_success)
):
    caso = db.query(Caso).filter(Caso.id == caso_id).first()
    if not caso:
        raise HTTPException(status_code=404, detail="Caso no encontrado")
    return caso


@router.post("/casos", response_model=CasoSchema)
def create_caso(
    caso_data: CasoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student_success)
):
    # Clasificación automática del nivel
    etapa_1 = f"Auto-clasificación: {caso_data.categoria}"
    
    caso = Caso(
        estudiante_id=caso_data.estudiante_id,
        ticket_id=caso_data.ticket_id,
        canal_origen=caso_data.canal_origen,
        categoria=caso_data.categoria,
        sintoma_inicial=caso_data.sintoma_inicial,
        etapa_1_filtro=etapa_1,
    )
    db.add(caso)
    db.commit()
    db.refresh(caso)
    
    return caso


@router.patch("/casos/{caso_id}", response_model=CasoSchema)
def update_caso(
    caso_id: int,
    caso_data: CasoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student_success)
):
    caso = db.query(Caso).filter(Caso.id == caso_id).first()
    if not caso:
        raise HTTPException(status_code=404, detail="Caso no encontrado")
    
    update_data = caso_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(caso, field, value)
    
    if caso_data.estado == CasoEstado.RESUELTO:
        caso.fecha_cierre = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(caso)
    
    return caso
