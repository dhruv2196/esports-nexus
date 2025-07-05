#!/bin/bash

# Deployment script for Esports Nexus

set -e

echo "🚀 Starting Esports Nexus Deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please copy .env.example to .env and configure it."
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists docker; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command_exists docker-compose; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Prerequisites check passed!"

# Parse command line arguments
ENVIRONMENT=${1:-development}
ACTION=${2:-up}

case $ENVIRONMENT in
    "development"|"dev")
        COMPOSE_FILE="docker-compose.yml"
        echo "🔧 Deploying in DEVELOPMENT mode..."
        ;;
    "production"|"prod")
        COMPOSE_FILE="docker-compose.prod.yml"
        echo "🏭 Deploying in PRODUCTION mode..."
        ;;
    *)
        echo "❌ Invalid environment: $ENVIRONMENT"
        echo "Usage: ./deploy.sh [development|production] [up|down|restart|logs|build]"
        exit 1
        ;;
esac

case $ACTION in
    "up")
        echo "🏗️  Building and starting containers..."
        docker-compose -f $COMPOSE_FILE up -d --build
        echo "✅ Deployment complete!"
        echo ""
        echo "🌐 Access the application:"
        if [ "$ENVIRONMENT" = "production" ]; then
            echo "   - Frontend: https://localhost"
            echo "   - Backend API: https://localhost/api"
        else
            echo "   - Frontend: http://localhost"
            echo "   - Backend API: http://localhost:8080/api"
            echo "   - MongoDB: mongodb://localhost:27017"
        fi
        ;;
    "down")
        echo "🛑 Stopping containers..."
        docker-compose -f $COMPOSE_FILE down
        echo "✅ Containers stopped!"
        ;;
    "restart")
        echo "🔄 Restarting containers..."
        docker-compose -f $COMPOSE_FILE restart
        echo "✅ Containers restarted!"
        ;;
    "logs")
        echo "📜 Showing logs..."
        docker-compose -f $COMPOSE_FILE logs -f
        ;;
    "build")
        echo "🏗️  Building containers..."
        docker-compose -f $COMPOSE_FILE build
        echo "✅ Build complete!"
        ;;
    *)
        echo "❌ Invalid action: $ACTION"
        echo "Usage: ./deploy.sh [development|production] [up|down|restart|logs|build]"
        exit 1
        ;;
esac