#!/bin/bash

# Mazadat Docker Setup Script
# This script helps manage Docker containers for the Mazadat application

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    print_success "Docker and Docker Compose are installed"
}

# Build images
build() {
    print_info "Building Docker images..."
    docker-compose build
    print_success "Images built successfully"
}

# Start containers
start() {
    print_info "Starting containers..."
    docker-compose up -d

    print_success "Containers started"
    print_info "Waiting for services to be ready..."
    sleep 5

    # Check if services are running
    if docker-compose ps | grep -q "Up"; then
        print_success "Services are running!"
        print_info "Frontend: http://localhost"
        print_info "Backend API: http://localhost:8080"
        print_info "MySQL: localhost:3306"
    else
        print_error "Some services failed to start. Check logs with: docker-compose logs"
    fi
}

# Stop containers
stop() {
    print_info "Stopping containers..."
    docker-compose down
    print_success "Containers stopped"
}

# View logs
logs() {
    if [ -z "$1" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$1"
    fi
}

# Show status
status() {
    print_info "Container status:"
    docker-compose ps
}

# Remove everything
clean() {
    print_warning "This will remove all containers, volumes, and images"
    read -p "Are you sure? (yes/no): " confirm

    if [ "$confirm" = "yes" ]; then
        print_info "Removing containers and volumes..."
        docker-compose down -v
        print_success "Cleanup complete"
    else
        print_info "Cleanup cancelled"
    fi
}

# Rebuild and restart
rebuild() {
    print_info "Rebuilding and restarting..."
    stop
    build
    start
}

# Main menu
show_help() {
    cat << EOF
${BLUE}Mazadat Docker Management Script${NC}

Usage: $0 [COMMAND]

Commands:
  build      - Build Docker images
  start      - Start containers
  stop       - Stop containers
  restart    - Restart containers (alias for stop + start)
  rebuild    - Rebuild images and restart containers
  logs       - View container logs (use 'logs backend' or 'logs frontend' for specific service)
  status     - Show container status
  clean      - Remove all containers, volumes, and images
  bash       - Open bash shell in backend container
  help       - Show this help message

Examples:
  $0 start
  $0 logs backend
  $0 rebuild
  $0 status

${YELLOW}Make sure Docker and Docker Compose are installed before running this script.${NC}
EOF
}

# Open bash in backend container
bash_backend() {
    print_info "Opening bash shell in backend container..."
    docker-compose exec backend bash
}

# Main script logic
case "${1:-help}" in
    build)
        check_docker
        build
        ;;
    start)
        check_docker
        start
        ;;
    stop)
        check_docker
        stop
        ;;
    restart)
        check_docker
        stop
        start
        ;;
    rebuild)
        check_docker
        rebuild
        ;;
    logs)
        check_docker
        logs "$2"
        ;;
    status)
        check_docker
        status
        ;;
    clean)
        check_docker
        clean
        ;;
    bash)
        check_docker
        bash_backend
        ;;
    help)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac

