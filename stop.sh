#!/bin/bash

# Esports Nexus - Stop Script
# This script stops all Esports Nexus services

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

print_color $YELLOW "🛑 Stopping Esports Nexus services..."

if command_exists docker-compose; then
    docker-compose -f docker-compose.microservices.yml down
else
    docker compose -f docker-compose.microservices.yml down
fi

print_color $GREEN "✅ All services have been stopped"
print_color $YELLOW "\nTo start services again, run: ./start.sh"