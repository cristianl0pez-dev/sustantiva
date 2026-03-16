#!/bin/bash

set -e

echo "=== Deploy Sustantiva ==="

# Configuration
NETWORK_NAME="sustantiva"
POSTGRES_CONTAINER="sustantiva-postgres"
REDIS_CONTAINER="sustantiva-redis"
BACKEND_CONTAINER="sustantiva-backend"
FRONTEND_CONTAINER="sustantiva-frontend"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Stop and remove existing containers
cleanup() {
    log_info "Limpiando contenedores existentes..."
    podman stop $FRONTEND_CONTAINER $BACKEND_CONTAINER $REDIS_CONTAINER $POSTGRES_CONTAINER 2>/dev/null || true
    podman rm $FRONTEND_CONTAINER $BACKEND_CONTAINER $REDIS_CONTAINER $POSTGRES_CONTAINER 2>/dev/null || true
}

# Create network
create_network() {
    log_info "Creando red $NETWORK_NAME..."
    if podman network inspect $NETWORK_NAME >/dev/null 2>&1; then
        log_warn "Red $NETWORK_NAME ya existe"
    else
        podman network create $NETWORK_NAME
    fi
}

# Build images
build_images() {
    log_info "Construyendo imágenes..."
    
    log_info "Building backend..."
    podman build --network=host -t sustantiva-backend ./backend
    
    log_info "Building frontend..."
    podman build --network=host -t sustantiva-frontend ./frontend
}

# Start PostgreSQL
start_postgres() {
    log_info "Iniciando PostgreSQL..."
    podman run -d --name $POSTGRES_CONTAINER \
        --network $NETWORK_NAME \
        -e POSTGRES_USER=postgres \
        -e POSTGRES_PASSWORD=postgres \
        -e POSTGRES_DB=sustantiva \
        -p 5432:5432 \
        postgres:15-alpine
    
    # Wait for PostgreSQL to be ready
    log_info "Esperando a PostgreSQL..."
    sleep 5
}

# Start Redis
start_redis() {
    log_info "Iniciando Redis..."
    podman run -d --name $REDIS_CONTAINER \
        --network $NETWORK_NAME \
        -p 6379:6379 \
        redis:7-alpine
}

# Start Backend
start_backend() {
    log_info "Iniciando Backend..."
    podman run -d --name $BACKEND_CONTAINER \
        --network $NETWORK_NAME \
        --hostname backend \
        -e DATABASE_URL=postgresql://postgres:postgres@$POSTGRES_CONTAINER:5432/sustantiva \
        -e SECRET_KEY=sustantiva-secret-key-change-in-production \
        -e ALGORITHM=HS256 \
        -e ACCESS_TOKEN_EXPIRE_MINUTES=30 \
        -p 8000:8000 \
        sustantiva-backend
    
    # Wait for backend to start
    log_info "Esperando al backend..."
    sleep 5
}

# Start Frontend
start_frontend() {
    log_info "Iniciando Frontend..."
    podman run -d --name $FRONTEND_CONTAINER \
        --network $NETWORK_NAME \
        --hostname frontend \
        -e VITE_API_TARGET=http://backend:8000 \
        -p 3000:3000 \
        sustantiva-frontend
}

# Initialize database
init_db() {
    log_info "Inicializando base de datos..."
    podman exec $BACKEND_CONTAINER python -m app.db.init_db
}

# Show status
show_status() {
    echo ""
    echo "=== Estado de los contenedores ==="
    podman ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    echo ""
    echo "=== URLs ==="
    echo "Frontend: http://localhost:3000"
    echo "Backend:  http://localhost:8000"
    echo "API Doc:  http://localhost:8000/docs"
}

# Main
main() {
    cleanup
    create_network
    build_images
    start_postgres
    start_redis
    start_backend
    start_frontend
    
    # Initialize database with users
    init_db
    
    show_status
    
    log_info "¡Deploy completado!"
}

# Run
main "$@"
