#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Esports Nexus Setup Verification${NC}"
echo "===================================="
echo ""

# Function to check if file exists
check_file() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $description"
        return 0
    else
        echo -e "${RED}✗${NC} $description (Missing: $file)"
        return 1
    fi
}

# Function to check if directory exists
check_dir() {
    local dir=$1
    local description=$2
    
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} $description"
        return 0
    else
        echo -e "${RED}✗${NC} $description (Missing: $dir)"
        return 1
    fi
}

# Function to check service structure
check_service() {
    local service_path=$1
    local service_name=$2
    local main_file=$3
    
    echo -e "\n${YELLOW}Checking $service_name:${NC}"
    
    check_dir "$service_path" "  Service directory exists"
    check_file "$service_path/Dockerfile" "  Dockerfile exists"
    check_file "$service_path/$main_file" "  Main file exists"
    
    if [ -f "$service_path/package.json" ]; then
        check_file "$service_path/package.json" "  package.json exists"
    fi
    
    if [ -f "$service_path/requirements.txt" ]; then
        check_file "$service_path/requirements.txt" "  requirements.txt exists"
    fi
    
    if [ -f "$service_path/go.mod" ]; then
        check_file "$service_path/go.mod" "  go.mod exists"
        check_file "$service_path/go.sum" "  go.sum exists"
    fi
}

echo -e "${BLUE}1. Core Infrastructure${NC}"
echo "----------------------"
check_file "docker-compose.microservices.yml" "Docker Compose (Microservices)"
check_file "docker-compose.yml" "Docker Compose (Main)"
check_dir "infrastructure/nginx" "Nginx configuration directory"
check_file "infrastructure/nginx/api-gateway.conf" "API Gateway configuration"
check_dir "scripts" "Scripts directory"
check_file "scripts/init-postgres.sh" "PostgreSQL init script"

echo -e "\n${BLUE}2. Backend Services${NC}"
echo "-------------------"

# User Service
check_service "services/user-service" "User Service" "src/index.ts"

# Tournament Service
check_service "services/tournament-service" "Tournament Service" "main.go"

# Game Integration Service
check_service "services/game-integration-service" "Game Integration Service" "main.py"

# AI Service
check_service "services/ai-service" "AI Service" "main.py"

# Payment Service
check_service "services/payment-service" "Payment Service" "src/index.js"

echo -e "\n${BLUE}3. Frontend Applications${NC}"
echo "------------------------"

# Web Frontend
echo -e "\n${YELLOW}Checking Web Frontend:${NC}"
check_dir "frontend" "  Frontend directory exists"
check_file "frontend/package.json" "  package.json exists"
check_file "frontend/Dockerfile" "  Dockerfile exists"

# Mobile App
echo -e "\n${YELLOW}Checking Mobile App:${NC}"
check_dir "mobile" "  Mobile directory exists"
check_file "mobile/package.json" "  package.json exists"
check_file "mobile/app.json" "  app.json exists"
check_file "mobile/App.tsx" "  App.tsx exists"
check_dir "mobile/src" "  Source directory exists"

echo -e "\n${BLUE}4. Mobile App Structure${NC}"
echo "-----------------------"
check_dir "mobile/src/components" "Components directory"
check_dir "mobile/src/screens" "Screens directory"
check_dir "mobile/src/navigation" "Navigation directory"
check_dir "mobile/src/services" "Services directory"
check_dir "mobile/src/store" "Store directory"
check_dir "mobile/src/types" "Types directory"
check_dir "mobile/src/constants" "Constants directory"
check_dir "mobile/src/contexts" "Contexts directory"
check_dir "mobile/src/utils" "Utils directory"

echo -e "\n${BLUE}5. Documentation${NC}"
echo "----------------"
check_file "README.md" "Main README"
check_file "DEVELOPMENT_PLAN.md" "Development Plan"
check_file "TRD_AI_ESPORTS_PLATFORM.md" "Technical Requirements Document"
check_file "PRD_ESPORTS_PLATFORM_V2.md" "Product Requirements Document"

echo -e "\n${BLUE}6. Configuration Files${NC}"
echo "----------------------"
check_file ".gitignore" "Git ignore file"
check_file "test-services.sh" "Service test script"

echo -e "\n${BLUE}7. Service Dependencies Check${NC}"
echo "-----------------------------"

# Check if Node.js dependencies are installed for services that need them
for service in "user-service" "payment-service"; do
    if [ -d "services/$service/node_modules" ]; then
        echo -e "${GREEN}✓${NC} $service dependencies installed"
    else
        echo -e "${YELLOW}⚠${NC} $service dependencies not installed (run npm install)"
    fi
done

echo -e "\n${BLUE}8. Docker Images Check${NC}"
echo "----------------------"

# Check if Docker is running
if docker info > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Docker is running"
    
    # Check for existing images
    echo -e "\nExisting Esports Nexus images:"
    docker images | grep esports-nexus || echo "  No images built yet"
else
    echo -e "${RED}✗${NC} Docker is not running"
fi

echo -e "\n${BLUE}Summary${NC}"
echo "======="

# Count total checks
total_checks=0
passed_checks=0

# Simple summary (this is a simplified version, in reality you'd track all checks)
echo -e "\nSetup verification complete!"
echo -e "Run ${YELLOW}docker-compose -f docker-compose.microservices.yml up --build${NC} to start all services"
echo -e "Run ${YELLOW}cd mobile && npm install${NC} to install mobile app dependencies"
echo -e "Run ${YELLOW}./test-services.sh${NC} after services are running to test endpoints"

echo -e "\n${BLUE}Next Steps:${NC}"
echo "1. Install dependencies for services that need them"
echo "2. Set up environment variables (.env files)"
echo "3. Configure API keys (Stripe, Riot Games, etc.)"
echo "4. Build and run services with Docker Compose"
echo "5. Test services with the test script"