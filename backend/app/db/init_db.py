from sqlalchemy.orm import Session
from app.db.session import engine, SessionLocal
from app.db.base import Base
from app.models.user import User
from app.models.bootcamp import Bootcamp
from app.core.security import get_password_hash


def init_db():
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
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
            
            bootcamp = Bootcamp(
                nombre="Full Stack Web Development",
                descripcion="Bootcamp intensivo de desarrollo web full stack",
                estado="activo"
            )
            db.add(bootcamp)
            
            db.commit()
            print("✅ Base de datos inicializada con datos de prueba")
            print("   Admin: admin@sustantiva.com / admin123")
            print("   Success: success@sustantiva.com / success123")
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
