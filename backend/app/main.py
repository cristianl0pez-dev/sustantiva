from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, bootcamps, estudiantes, conversaciones, notas, actividades, dashboard, tickets, config_riesgo
from app.db.base import Base
from app.db.session import engine

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Sustantiva API",
    description="CRM para Bootcamps - Plataforma de Seguimiento de Estudiantes",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(bootcamps.router, prefix="/api")
app.include_router(estudiantes.router, prefix="/api")
app.include_router(conversaciones.router, prefix="/api")
app.include_router(notas.router, prefix="/api")
app.include_router(actividades.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(tickets.router, prefix="/api")
app.include_router(config_riesgo.router, prefix="/api")


@app.get("/")
def root():
    return {"message": "Sustantiva API", "status": "running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
