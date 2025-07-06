#!/bin/bash

# Esports Nexus - Quick Start Script
# This script helps you quickly start the Esports Nexus platform

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    color=$1
    message=$2
    echo -e "${color}${message}${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Docker
check_docker() {
    if ! command_exists docker; then
        print_color $RED "❌ Docker is not installed!"
        print_color $YELLOW "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
        exit 1
    fi

    if ! docker info >/dev/null 2>&1; then
        print_color $RED "❌ Docker is not running!"
        print_color $YELLOW "Please start Docker Desktop and try again."
        exit 1
    fi

    print_color $GREEN "✅ Docker is installed and running"
}

# Function to check Docker Compose
check_docker_compose() {
    if ! command_exists docker-compose && ! docker compose version >/dev/null 2>&1; then
        print_color $RED "❌ Docker Compose is not installed!"
        print_color $YELLOW "Docker Compose should come with Docker Desktop. Please reinstall Docker Desktop."
        exit 1
    fi
    print_color $GREEN "✅ Docker Compose is available"
}

# Function to check ports
check_ports() {
    local ports=(80 8000 3000 5432 27017 6379 8080 8081 5000 5001 8083)
    local occupied=()
    
    for port in "${ports[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            occupied+=($port)
        fi
    done
    
    if [ ${#occupied[@]} -ne 0 ]; then
        print_color $YELLOW "⚠️  The following ports are already in use: ${occupied[*]}"
        print_color $YELLOW "Do you want to stop the services using these ports? (y/n)"
        read -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            return 0
        else
            print_color $RED "Please free up the ports and try again."
            exit 1
        fi
    else
        print_color $GREEN "✅ All required ports are available"
    fi
}

# Function to start services
start_services() {
    print_color $YELLOW "🚀 Starting Esports Nexus services..."
    
    # Use docker-compose or docker compose based on what's available
    if command_exists docker-compose; then
        docker-compose -f docker-compose.microservices.yml up -d
    else
        docker compose -f docker-compose.microservices.yml up -d
    fi
    
    print_color $GREEN "✅ Services are starting..."
}

# Function to wait for services
wait_for_services() {
    print_color $YELLOW "⏳ Waiting for services to be ready..."
    
    # Wait for API Gateway
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s http://localhost:8000/health >/dev/null 2>&1; then
            print_color $GREEN "✅ API Gateway is ready!"
            break
        fi
        attempt=$((attempt + 1))
        sleep 2
    done
    
    if [ $attempt -eq $max_attempts ]; then
        print_color $YELLOW "⚠️  API Gateway is taking longer than expected to start."
        print_color $YELLOW "You can check the logs with: docker-compose -f docker-compose.microservices.yml logs"
    fi
}

# Function to show status
show_status() {
    print_color $GREEN "\n🎮 Esports Nexus is ready!"
    print_color $GREEN "================================"
    print_color $GREEN "📱 Web Application: http://localhost"
    print_color $GREEN "🔌 API Gateway: http://localhost:8000"
    print_color $GREEN "📊 API Health: http://localhost:8000/health"
    print_color $GREEN "================================"
    
    print_color $YELLOW "\n📖 Useful commands:"
    echo "• View logs: docker-compose -f docker-compose.microservices.yml logs -f"
    echo "• Stop services: docker-compose -f docker-compose.microservices.yml down"
    echo "• View service status: docker-compose -f docker-compose.microservices.yml ps"
    
    print_color $YELLOW "\n📱 To run the mobile app:"
    echo "• iOS: cd mobile && npx react-native run-ios"
    echo "• Android: cd mobile && npx react-native run-android"
    
    print_color $GREEN "\n✨ Happy gaming! For more details, see RUNNING_GUIDE.md"
}

# Main execution
main() {
    print_color $GREEN "🎮 Esports Nexus - Quick Start"
    print_color $GREEN "=============================="
    
    # Check prerequisites
    print_color $YELLOW "\n📋 Checking prerequisites..."
    check_docker
    check_docker_compose
    check_ports
    
    # Start services
    print_color $YELLOW "\n🚀 Starting services..."
    start_services
    
    # Wait for services
    wait_for_services
    
    # Show status
    show_status
}

# Handle script arguments
case "${1:-}" in
    stop)
        print_color $YELLOW "🛑 Stopping Esports Nexus services..."
        if command_exists docker-compose; then
            docker-compose -f docker-compose.microservices.yml down
        else
            docker compose -f docker-compose.microservices.yml down
        fi
        print_color $GREEN "✅ Services stopped"
        ;;
    restart)
        print_color $YELLOW "🔄 Restarting Esports Nexus services..."
        if command_exists docker-compose; then
            docker-compose -f docker-compose.microservices.yml down
            docker-compose -f docker-compose.microservices.yml up -d
        else
            docker compose -f docker-compose.microservices.yml down
            docker compose -f docker-compose.microservices.yml up -d
        fi
        wait_for_services
        show_status
        ;;
    status)
        if command_exists docker-compose; then
            docker-compose -f docker-compose.microservices.yml ps
        else
            docker compose -f docker-compose.microservices.yml ps
        fi
        ;;
    logs)
        if command_exists docker-compose; then
            docker-compose -f docker-compose.microservices.yml logs -f
        else
            docker compose -f docker-compose.microservices.yml logs -f
        fi
        ;;
    *)
        main
        ;;
esac