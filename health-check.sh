#!/bin/bash

# Health check script for Esports Nexus

echo "🏥 Running health checks for Esports Nexus..."

# Function to check service health
check_service() {
    local service_name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Checking $service_name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" $url)
    
    if [ "$response" = "$expected_status" ]; then
        echo "✅ Healthy"
        return 0
    else
        echo "❌ Unhealthy (HTTP $response)"
        return 1
    fi
}

# Check if containers are running
echo "📦 Checking container status..."
docker-compose ps

echo ""
echo "🔍 Checking service health..."

# Check frontend
check_service "Frontend" "http://localhost" 200

# Check backend API
check_service "Backend API" "http://localhost:8080/api/actuator/health" 200

# Check MongoDB connection
echo -n "Checking MongoDB... "
if docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo "✅ Healthy"
else
    echo "❌ Unhealthy"
fi

# Check Redis (if using production setup)
if docker-compose ps | grep -q redis; then
    echo -n "Checking Redis... "
    if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
        echo "✅ Healthy"
    else
        echo "❌ Unhealthy"
    fi
fi

echo ""
echo "🏁 Health check complete!"