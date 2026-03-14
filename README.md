# Sustantiva - CRM para Bootcamps

Plataforma de seguimiento de estudiantes para bootcamps con gestión de kanban, conversaciones, notas y métricas.

## Stack Tecnológico

- **Backend**: FastAPI + PostgreSQL + SQLAlchemy
- **Frontend**: Next.js 14 + React + TailwindCSS
- **Drag & Drop**: @hello-pangea/dnd
- **Estado**: React Query + Context

## Estructura del Proyecto

```
sustantiva/
├── backend/              # API FastAPI
│   ├── app/
│   │   ├── api/        # Endpoints
│   │   ├── core/        # Autenticación y seguridad
│   │   ├── models/      # Modelos SQLAlchemy
│   │   ├── schemas/     # Schemas Pydantic
│   │   └── db/          # Conexión a BD
│   └── requirements.txt
├── frontend/            # App Next.js
│   ├── src/
│   │   ├── app/        # Páginas
│   │   ├── components/ # Componentes
│   │   ├── hooks/      # Hooks personalizados
│   │   ├── lib/        # Utils y API client
│   │   └── types/      # Tipos TypeScript
│   └── package.json
└── docker-compose.yml
```

## Inicio Rápido

### Con Docker (Recomendado)

```bash
# Levantar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### Local (Sin Docker)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m app.db.init_db   # Inicializar BD con datos de prueba
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Credenciales de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@sustantiva.com | admin123 |
| Student Success | success@sustantiva.com | success123 |

## API Endpoints

| Recurso | Métodos |
|---------|---------|
| `/api/auth` | POST login, register, GET me |
| `/api/bootcamps` | GET, POST, PUT, DELETE |
| `/api/estudiantes` | GET, POST, PATCH, DELETE |
| `/api/estudiantes/kanban` | GET |
| `/api/conversaciones` | GET, POST, DELETE |
| `/api/notas` | GET, POST, DELETE |
| `/api/actividades` | GET, POST, PATCH, DELETE |
| `/api/dashboard` | GET métricas |

## Funcionalidades

- ✅ Autenticación JWT con roles
- ✅ Gestión de bootcamps
- ✅ Gestión de estudiantes
- ✅ Kanban drag-and-drop
- ✅ Perfil de estudiante con timeline
- ✅ Conversaciones (email, WhatsApp, llamada, reunión)
- ✅ Notas internas
- ✅ Tareas de seguimiento
- ✅ Dashboard con métricas
- ✅ Sistema de riesgo de deserción

## Roles

| Rol | Permisos |
|-----|-----------|
| admin | Todo |
| student_success | Ver/editar estudiantes, ver métricas |
| profesor | Ver estudiantes, agregar notas |
| mentor | Ver estudiantes, agregar notas |

## Puertos

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- PostgreSQL: localhost:5432
