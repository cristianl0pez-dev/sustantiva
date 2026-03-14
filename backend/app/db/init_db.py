from sqlalchemy.orm import Session
from app.db.session import engine, SessionLocal
from app.db.base import Base
from app.models.user import User
from app.models.bootcamp import Bootcamp
from app.models.estudiante import Estudiante, EstudianteEstado
from app.models.conversacion import Conversacion, ConversacionTipo
from app.models.nota import Nota
from app.models.actividad import Actividad, ActividadEstado
from app.core.security import get_password_hash
from datetime import datetime, timedelta
import random

NOMBRES = ["Juan", "Maria", "Carlos", "Ana", "Pedro", "Laura", "Diego", "Sofia", "Miguel", "Isabella", 
           "Gabriel", "Valentina", "Pablo", "Camila", "Fernando", "Luciana", "Ricardo", "Antonella",
           "Javier", "Daniela", "Luis", "Victoria", "Eduardo", "Natalia", "Alejandro", "Andrea",
           "Roberto", "Claudia", "Francisco", "Mariana"]

APELLIDOS = ["Garcia", "Rodriguez", "Martinez", "Lopez", "Gonzalez", "Perez", "Sanchez", "Ramirez",
             "Torres", "Flores", "Rivera", "Gomez", "Diaz", "Cruz", "Reyes", "Morales", "Ortiz",
             "Gutierrez", "Chavez", "Ramos", "Vargas", "Castillo", "Jimenez", "Moreno", "Herrera"]

CURSOS = [
    ("Full Stack Web Development", "Bootcamp intensivo de desarrollo web full stack con React, Node.js y PostgreSQL"),
    ("Data Science & Machine Learning", "Bootcamp de ciencia de datos con Python, Pandas y TensorFlow"),
    ("UX/UI Design", "Bootcamp de diseño de experiencias de usuario e interfaces"),
    ("Cybersecurity", "Bootcamp de seguridad informatica y pentesting"),
    ("Cloud Computing with AWS", "Bootcamp de cloud computing con Amazon Web Services"),
]

def init_db():
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Crear usuarios
        existing_admin = db.query(User).filter(User.email == "admin@sustantiva.com").first()
        if not existing_admin:
            admin = User(
                email="admin@sustantiva.com",
                nombre="Administrador",
                hashed_password=get_password_hash("admin123"),
                rol="admin"
            )
            db.add(admin)
            
            success = User(
                email="success@sustantiva.com",
                nombre="Student Success",
                hashed_password=get_password_hash("success123"),
                rol="student_success"
            )
            db.add(success)
            
            profesor = User(
                email="profesor@sustantiva.com",
                nombre="Profesor",
                hashed_password=get_password_hash("profesor123"),
                rol="profesor"
            )
            db.add(profesor)
            
            db.commit()
            print("✅ Usuarios creados")
        
        # Obtener usuarios
        users = db.query(User).all()
        success_user = db.query(User).filter(User.rol == "student_success").first()
        
        # Crear bootcamps
        bootcamps = []
        for i, (nombre, desc) in enumerate(CURSOS):
            estado = "activo" if i < 3 else ("planificado" if i == 3 else "finalizado")
            bootcamp = Bootcamp(
                nombre=nombre,
                descripcion=desc,
                fecha_inicio=datetime.now().date() - timedelta(days=random.randint(30, 90)),
                fecha_fin=datetime.now().date() + timedelta(days=random.randint(30, 90)),
                estado=estado
            )
            db.add(bootcamp)
            bootcamps.append(bootcamp)
        
        db.commit()
        
        # Obtener bootcamps
        bootcamps = db.query(Bootcamp).all()
        print(f"✅ {len(bootcamps)} bootcamps creados")
        
        # Crear estudiantes
        estados = list(EstudianteEstado)
        estados_peso = [
            (EstudianteEstado.NUEVO, 0.1),
            (EstudianteEstado.ONBOARDING, 0.15),
            (EstudianteEstado.ACTIVO, 0.35),
            (EstudianteEstado.NECESITA_SEGUIMIENTO, 0.1),
            (EstudianteEstado.EN_RIESGO, 0.1),
            (EstudianteEstado.REACTIVADO, 0.05),
            (EstudianteEstado.GRADUADO, 0.1),
            (EstudianteEstado.ABANDONO, 0.05),
        ]
        
        estudiantes_creados = 0
        for bootcamp in bootcamps:
            # 20 estudiantes por bootcamp
            for i in range(20):
                nombre = random.choice(NOMBRES)
                apellido = random.choice(APELLIDOS)
                email = f"{nombre.lower()}.{apellido.lower()}{i}@example.com"
                
                # Seleccionar estado basado en pesos
                estado = random.choices(
                    [e[0] for e in estados_peso],
                    weights=[e[1] for e in estados_peso]
                )[0]
                
                # Calcular riesgo basado en estado
                riesgo = 0
                if estado == EstudianteEstado.EN_RIESGO:
                    riesgo = random.randint(60, 100)
                elif estado == EstudianteEstado.NECESITA_SEGUIMIENTO:
                    riesgo = random.randint(30, 59)
                elif estado == EstudianteEstado.ABANDONO:
                    riesgo = 100
                else:
                    riesgo = random.randint(0, 29)
                
                fecha_ingreso = bootcamp.fecha_inicio + timedelta(days=random.randint(0, 15)) if bootcamp.fecha_inicio else (datetime.now().date() - timedelta(days=random.randint(1, 30)))
                
                ultimo_contacto = datetime.now() - timedelta(days=random.randint(0, 30)) if random.random() > 0.2 else None
                
                estudiante = Estudiante(
                    nombre=nombre,
                    apellido=apellido,
                    email=email,
                    telefono=f"+54{random.randint(900000000, 999999999)}",
                    whatsapp=f"+54{random.randint(900000000, 999999999)}",
                    bootcamp_id=bootcamp.id,
                    estado=estado,
                    riesgo_desercion=riesgo,
                    fecha_ingreso=fecha_ingreso,
                    ultimo_contacto=ultimo_contacto,
                    responsable_id=success_user.id if success_user else None
                )
                db.add(estudiante)
                estudiantes_creados += 1
                
                # Crear conversaciones para algunos estudiantes
                if random.random() > 0.3:
                    num_conversaciones = random.randint(1, 5)
                    for j in range(num_conversaciones):
                        conversacion = Conversacion(
                            estudiante_id=estudiante.id,
                            tipo=random.choice(list(ConversacionTipo)),
                            mensaje=f"Conversacion de seguimiento #{j+1}. {random.choice(['El estudiante esta progressing bien', 'Tuvo algunas dificultades', 'Necesita apoyo adicional', 'Todo OK'])}",
                            usuario_id=success_user.id if success_user else None,
                            fecha=datetime.now() - timedelta(days=random.randint(0, 30))
                        )
                        db.add(conversacion)
                
                # Crear notas para algunos estudiantes
                if random.random() > 0.4:
                    nota = Nota(
                        estudiante_id=estudiante.id,
                        autor_id=success_user.id if success_user else None,
                        contenido=f"Nota sobre {nombre}: {random.choice(['Buen rendimiento', 'Faltas injustificadas', 'muy comprometido', 'participa activamente', 'necesita seguimiento'])}",
                        fecha=datetime.now() - timedelta(days=random.randint(0, 15))
                    )
                    db.add(nota)
                
                # Crear actividades para algunos estudiantes
                if random.random() > 0.5 and estado not in [EstudianteEstado.GRADUADO, EstudianteEstado.ABANDONO]:
                    actividad = Actividad(
                        estudiante_id=estudiante.id,
                        titulo=f"Tarea de seguimiento - {nombre}",
                        descripcion=random.choice(["Llamada de seguimiento", "Revisar proyecto", "Reunion de feedback", "Enviar recursos"]),
                        fecha_limite=datetime.now() + timedelta(days=random.randint(1, 14)),
                        estado=random.choice([ActividadEstado.PENDIENTE, ActividadEstado.EN_PROGRESO, ActividadEstado.COMPLETADA]),
                        responsable_id=success_user.id if success_user else None
                    )
                    db.add(actividad)
        
        db.commit()
        print(f"✅ {estudiantes_creados} estudiantes creados")
        print(f"   - {len(bootcamps)} bootcamps")
        print(f"   - 20 estudiantes por bootcamp")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
