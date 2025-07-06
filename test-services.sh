#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🚀 Testing Esports Nexus Services"
echo "================================="

# Function to test service health
test_service() {
    local service_name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Testing $service_name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✓ OK${NC} (Status: $response)"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (Status: $response)"
        return 1
    fi
}

# Function to test API endpoint
test_api() {
    local endpoint_name=$1
    local method=$2
    local url=$3
    local data=$4
    local expected_status=${5:-200}
    
    echo -n "Testing $endpoint_name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" -H "Content-Type: application/json" -d "$data" "$url")
    fi
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✓ OK${NC} (Status: $response)"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (Status: $response)"
        return 1
    fi
}

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 5

echo ""
echo "1. Testing Service Health Endpoints"
echo "-----------------------------------"

# Test each service
test_service "User Service" "http://localhost:3000/health"
test_service "Tournament Service" "http://localhost:8081/health"
test_service "Game Integration Service" "http://localhost:5000/health"
test_service "AI Service" "http://localhost:5001/health"
test_service "Payment Service" "http://localhost:8083/health"
test_service "Legacy Backend" "http://localhost:8080/actuator/health"
test_service "Frontend" "http://localhost:80"

echo ""
echo "2. Testing API Endpoints"
echo "------------------------"

# Test User Service endpoints
test_api "User Registration" "POST" "http://localhost:3000/api/v1/auth/register" \
    '{"username":"testuser","email":"test@example.com","password":"Test123!@#"}' 201

# Test Tournament Service endpoints
test_api "Get Tournaments" "GET" "http://localhost:8081/api/v1/tournaments"

# Test Game Integration Service endpoints
test_api "Get Supported Games" "GET" "http://localhost:5000/api/v1/games"

# Test AI Service endpoints
test_api "AI Health Check" "GET" "http://localhost:5001/health"

echo ""
echo "3. Testing Database Connections"
echo "--------------------------------"

# Test PostgreSQL
echo -n "Testing PostgreSQL... "
if docker exec esports-nexus-postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
fi

# Test MongoDB
echo -n "Testing MongoDB... "
if docker exec esports-nexus-mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
fi

# Test Redis
echo -n "Testing Redis... "
if docker exec esports-nexus-redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ FAILED${NC}"
fi

echo ""
echo "4. Testing Service Communication"
echo "---------------------------------"

# Test API Gateway routing (if configured)
if [ -f "./infrastructure/nginx/api-gateway.conf" ]; then
    echo "Testing API Gateway routes..."
    test_api "Gateway -> User Service" "GET" "http://localhost:8000/api/v1/users/health"
    test_api "Gateway -> Tournament Service" "GET" "http://localhost:8000/api/v1/tournaments"
    test_api "Gateway -> Game Service" "GET" "http://localhost:8000/api/v1/games"
else
    echo -e "${YELLOW}⚠ API Gateway not configured${NC}"
fi

echo ""
echo "5. Service Logs Summary"
echo "-----------------------"

# Check for errors in logs
for service in user-service tournament-service game-integration-service ai-service payment-service; do
    echo -n "Checking $service logs... "
    if docker logs "esports-nexus-$service" 2>&1 | grep -i "error" > /dev/null; then
        echo -e "${YELLOW}⚠ Errors found${NC}"
    else
        echo -e "${GREEN}✓ Clean${NC}"
    fi
done

echo ""
echo "================================="
echo "Test Summary Complete!"
echo ""

# Docker container status
echo "Container Status:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep esports-nexus

echo ""
echo "To view logs for a specific service, use:"
echo "  docker logs esports-nexus-<service-name>"
echo ""
echo "To access service shells:"
echo "  docker exec -it esports-nexus-<service-name> /bin/sh"