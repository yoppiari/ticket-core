#!/bin/bash

# Ticketing System Development Script
# Runs Docker services, Laravel backend, and Next.js frontend

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# PID file locations
BACKEND_PID_FILE=".backend.pid"
FRONTEND_PID_FILE=".frontend.pid"
DOCKER_COMPOSE_FILE="docker-compose.yml"

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Cleanup function
cleanup() {
    print_status "Stopping all services..."

    # Kill backend process
    if [ -f "$BACKEND_PID_FILE" ]; then
        BACKEND_PID=$(cat "$BACKEND_PID_FILE")
        if kill -0 "$BACKEND_PID" 2>/dev/null; then
            kill "$BACKEND_PID" 2>/dev/null || true
            print_success "Backend stopped"
        fi
        rm -f "$BACKEND_PID_FILE"
    fi

    # Kill frontend process
    if [ -f "$FRONTEND_PID_FILE" ]; then
        FRONTEND_PID=$(cat "$FRONTEND_PID_FILE")
        if kill -0 "$FRONTEND_PID" 2>/dev/null; then
            kill "$FRONTEND_PID" 2>/dev/null || true
            print_success "Frontend stopped"
        fi
        rm -f "$FRONTEND_PID_FILE"
    fi

    # Stop Docker services
    if [ -f "$DOCKER_COMPOSE_FILE" ]; then
        print_status "Stopping Docker services..."
        docker compose down 2>/dev/null || true
        print_success "Docker services stopped"
    fi

    print_success "All services stopped"
    exit 0
}

# Set trap for cleanup
trap cleanup INT TERM

# Check if we're in the project root
if [ ! -d "apps/backend" ] || [ ! -d "apps/frontend" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

echo ""
echo "🎫 Ticketing System Development Environment"
echo "==========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if PHP is installed
if ! command -v php &> /dev/null; then
    print_error "PHP is not installed. Please install PHP first."
    exit 1
fi

# Check if Composer is installed
if ! command -v composer &> /dev/null; then
    print_warning "Composer is not installed. Laravel backend might not work properly."
fi

# Start Docker services
print_status "Starting Docker services (PostgreSQL, Redis, Mailpit)..."
docker compose up -d

# Wait for services to be ready
print_status "Waiting for Docker services to be ready..."
sleep 3

# Check if services are running
if ! docker compose ps | grep -q "postgres"; then
    print_error "PostgreSQL failed to start"
    exit 1
fi

print_success "Docker services started"
print_status "  PostgreSQL: localhost:5440"
print_status "  Redis: localhost:6380"
print_status "  Mailpit UI: http://localhost:8025"
print_status "  Mailpit SMTP: localhost:1025"

# Kill any processes on required ports
print_status "Cleaning up application ports..."
BACKEND_PORT=8000
FRONTEND_PORT=3000

# Kill processes on specific ports
for port in 3000 8000; do
    if lsof -ti:$port > /dev/null 2>&1; then
        print_warning "Port $port is in use, killing process..."
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
done

print_success "All ports cleaned up"

# Setup Backend
cd apps/backend

# Check if .env exists
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        print_status "Creating .env from .env.example..."
        cp .env.example .env
        print_success ".env created"
    else
        print_error ".env.example not found. Cannot create .env file."
        exit 1
    fi
fi

# Check if vendor directory exists
if [ ! -d "vendor" ]; then
    print_status "Installing backend dependencies..."
    composer install
fi

# Generate app key if not set
if ! grep -q "APP_KEY=base64:" .env; then
    print_status "Generating application key..."
    php artisan key:generate
fi

# Run migrations
print_status "Running database migrations..."
php artisan migrate --force 2>/dev/null || print_warning "Migrations might have failed or already run"

# Start Backend
print_status "Starting Laravel backend server..."
php artisan serve --host=0.0.0.0 --port=8000 > ../../backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > "../../$BACKEND_PID_FILE"
cd ../..

print_success "Backend started (PID: $BACKEND_PID)"

# Wait for backend to bind to port
print_status "Waiting for backend to be ready..."
for i in {1..30}; do
    if lsof -ti:8000 > /dev/null 2>&1; then
        print_success "Backend is listening on port 8000"
        break
    fi
    if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
        print_error "Backend failed to start. Check backend.log for errors."
        tail -30 backend.log
        exit 1
    fi
    sleep 1
done

if ! lsof -ti:8000 > /dev/null 2>&1; then
    print_error "Backend failed to bind to port 8000. Check backend.log for errors."
    tail -30 backend.log
    exit 1
fi

# Setup Frontend
cd apps/frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_status "Installing frontend dependencies..."
    npm install
fi

# Start Frontend
print_status "Starting Next.js frontend server..."
npm run dev > ../../frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > "../../$FRONTEND_PID_FILE"
cd ../..

print_success "Frontend started (PID: $FRONTEND_PID)"

# Wait for frontend to be ready
print_status "Waiting for frontend to be ready..."
sleep 5

# Display access information
echo ""
echo "=================================================================="
echo "🎫 Ticketing System Development Environment Ready!"
echo "=================================================================="
echo ""
echo "📊 Application URLs:"
echo "   Frontend:     http://localhost:3002"
echo "   Backend API:  http://localhost:8000/api"
echo ""
echo "🗄️  Database & Services:"
echo "   PostgreSQL:   localhost:5440 (user: postgres, db: ticketing)"
echo "   Redis:        localhost:6380"
echo "   Mailpit UI:   http://localhost:8025"
echo "   Mailpit SMTP: localhost:1025"
echo ""
echo "📝 Logs:"
echo "   Backend:      tail -f backend.log"
echo "   Frontend:     tail -f frontend.log"
echo "   Docker:       docker compose logs -f"
echo ""
echo "🛠️  Commands:"
echo "   Stop:         Press Ctrl+C"
echo "   Restart:      Stop and run ./dev.sh again"
echo "   Migrations:   cd apps/backend && php artisan migrate"
echo "   Clear Cache:  cd apps/backend && php artisan cache:clear"
echo ""
echo "=================================================================="

print_success "Development environment is running!"
print_status "Press Ctrl+C to stop all services"
echo ""

# Keep script running
wait
