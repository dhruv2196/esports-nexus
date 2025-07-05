#!/bin/bash

echo "🧪 Testing Docker setup for Esports Nexus..."

# Check Docker
echo -n "Checking Docker... "
if docker --version > /dev/null 2>&1; then
    echo "✅ $(docker --version)"
else
    echo "❌ Docker not found"
    exit 1
fi

# Check Docker Compose
echo -n "Checking Docker Compose... "
if docker-compose --version > /dev/null 2>&1; then
    echo "✅ $(docker-compose --version)"
else
    echo "❌ Docker Compose not found"
    exit 1
fi

# Check if Docker daemon is running
echo -n "Checking Docker daemon... "
if docker info > /dev/null 2>&1; then
    echo "✅ Running"
else
    echo "❌ Not running"
    exit 1
fi

# Test building images
echo ""
echo "🏗️  Testing Docker build..."

# Test backend build
echo "Building backend image..."
cd backend
docker build -t esports-nexus-backend-test . --target build
if [ $? -eq 0 ]; then
    echo "✅ Backend build successful"
else
    echo "❌ Backend build failed"
    exit 1
fi

# Test frontend build
echo "Building frontend image..."
cd ../frontend
docker build -t esports-nexus-frontend-test . --target build
if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi

cd ..

# Clean up test images
echo ""
echo "🧹 Cleaning up test images..."
docker rmi esports-nexus-backend-test esports-nexus-frontend-test > /dev/null 2>&1

echo ""
echo "✅ Docker setup test completed successfully!"
echo ""
echo "You can now deploy the application using:"
echo "  ./deploy.sh development up"