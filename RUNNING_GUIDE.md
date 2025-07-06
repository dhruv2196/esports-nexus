# Esports Nexus - Complete Running Guide

This guide provides comprehensive instructions for running the Esports Nexus platform, including the web application, microservices, and mobile app.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Running the Web Application](#running-the-web-application)
- [Running the Mobile App](#running-the-mobile-app)
- [Architecture Overview](#architecture-overview)
- [Troubleshooting](#troubleshooting)
- [Development Tips](#development-tips)

## Prerequisites

Before running the application, ensure you have the following installed:

### Required Software
- **Docker Desktop** (v4.0 or higher) - [Download](https://www.docker.com/products/docker-desktop)
- **Docker Compose** (usually included with Docker Desktop)
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/)

### For Mobile Development (Optional)
- **For iOS**: Xcode (macOS only) - [Download](https://apps.apple.com/app/xcode/id497799835)
- **For Android**: Android Studio - [Download](https://developer.android.com/studio)
- **React Native CLI**: Install with `npm install -g react-native-cli`

### System Requirements
- **RAM**: Minimum 8GB (16GB recommended)
- **Storage**: At least 10GB free space
- **OS**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+)

## Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd esports-nexus
```

### 2. Start All Services with Docker Compose
```bash
# Start all microservices, databases, and the web application
docker-compose -f docker-compose.microservices.yml up -d

# Check if all services are running
docker-compose -f docker-compose.microservices.yml ps
```

### 3. Access the Application
- **Web Application**: http://localhost
- **API Gateway**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api-docs

## Running the Web Application

### Option 1: Using Docker (Recommended)

The web application runs automatically when you start the microservices:

```bash
# Start all services including the frontend
docker-compose -f docker-compose.microservices.yml up -d

# View logs if needed
docker-compose -f docker-compose.microservices.yml logs -f frontend
```

Access the web application at: **http://localhost**

### Option 2: Running Locally (Development)

If you want to run the frontend locally for development:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env file with your API URL
# REACT_APP_API_URL=http://localhost:8000/api/v1

# Start development server
npm start
```

Access the development server at: **http://localhost:3000**

## Running the Mobile App

### Prerequisites for Mobile Development

1. **Install React Native dependencies**:
   ```bash
   cd mobile
   npm install
   ```

2. **Install CocoaPods (iOS only)**:
   ```bash
   cd ios
   pod install
   cd ..
   ```

### Running on iOS (macOS only)

```bash
# Make sure the backend services are running
docker-compose -f docker-compose.microservices.yml up -d

# Navigate to mobile directory
cd mobile

# Start Metro bundler
npx react-native start

# In a new terminal, run iOS app
npx react-native run-ios

# Or open in Xcode
open ios/EsportsNexus.xcworkspace
```

### Running on Android

```bash
# Make sure the backend services are running
docker-compose -f docker-compose.microservices.yml up -d

# Navigate to mobile directory
cd mobile

# Start Metro bundler
npx react-native start

# In a new terminal, run Android app
npx react-native run-android

# Or open in Android Studio
# File -> Open -> Select 'android' folder
```

### Configuring Mobile App API Endpoint

Update the API configuration in `mobile/src/config/api.js`:

```javascript
// For iOS Simulator
const API_BASE_URL = 'http://localhost:8000/api/v1';

// For Android Emulator
const API_BASE_URL = 'http://10.0.2.2:8000/api/v1';

// For Physical Device (use your computer's IP)
const API_BASE_URL = 'http://YOUR_COMPUTER_IP:8000/api/v1';
```

## Architecture Overview

### Services and Ports

| Service | Port | Description |
|---------|------|-------------|
| Frontend (Web) | 80 | React web application |
| API Gateway | 8000 | NGINX reverse proxy |
| User Service | 3000 | Authentication & user management |
| Tournament Service | 8081 | Tournament management |
| Game Integration | 5000 | Game API integrations |
| AI Service | 5001 | Analytics & predictions |
| Payment Service | 8083 | Payment processing |
| Legacy Backend | 8080 | Spring Boot monolith (being migrated) |
| PostgreSQL | 5432 | Primary database |
| MongoDB | 27017 | Legacy database |
| Redis | 6379 | Caching & sessions |

### Default Credentials

**PostgreSQL**:
- Username: `postgres`
- Password: `postgres`

**MongoDB**:
- Username: `admin`
- Password: `esportsNexusAdmin2024`

## Troubleshooting

### Common Issues and Solutions

#### 1. JWT Secret Key Error
If you see an error about "signing key's size is 360 bits which is not secure enough for the HS512 algorithm":

```bash
# The JWT secret has already been fixed in docker-compose.microservices.yml
# Just restart the affected services:
docker-compose -f docker-compose.microservices.yml restart backend user-service payment-service

# If you want to generate your own secure JWT secret:
./generate-jwt-secret.sh

# Or manually generate one:
openssl rand -base64 64
```

**Note**: The JWT secret must be at least 512 bits (64 bytes) long for the HS512 algorithm. The default configuration already includes a properly sized secret.

**Important**: The JWT_SECRET is configured in multiple places:
- `.env` file (for reference)
- `docker-compose.microservices.yml` (used by Docker services)
- `backend/src/main/resources/application.properties` (for local development)

Make sure to update all locations if you change the secret.

#### 2. Services Won't Start
```bash
# Check Docker is running
docker info

# Check for port conflicts
netstat -an | grep -E '(80|8000|3000|5432|27017|6379)'

# Stop all services and restart
docker-compose -f docker-compose.microservices.yml down
docker-compose -f docker-compose.microservices.yml up -d
```

#### 2. Database Connection Issues
```bash
# Check if databases are healthy
docker-compose -f docker-compose.microservices.yml ps

# View database logs
docker-compose -f docker-compose.microservices.yml logs postgres
docker-compose -f docker-compose.microservices.yml logs mongodb

# Manually create missing databases
docker exec -it esports-nexus-postgres psql -U postgres -c "CREATE DATABASE esports_nexus_payments;"
```

#### 3. API Gateway Not Working
```bash
# Check nginx configuration
docker-compose -f docker-compose.microservices.yml logs api-gateway

# Test health endpoint
curl http://localhost:8000/health
```

#### 4. Mobile App Can't Connect to Backend
- For iOS Simulator: Use `http://localhost:8000`
- For Android Emulator: Use `http://10.0.2.2:8000`
- For Physical Device: Use your computer's IP address

Find your IP address:
- **macOS/Linux**: `ifconfig | grep inet`
- **Windows**: `ipconfig | findstr IPv4`

### Viewing Logs

```bash
# View all logs
docker-compose -f docker-compose.microservices.yml logs

# View specific service logs
docker-compose -f docker-compose.microservices.yml logs user-service

# Follow logs in real-time
docker-compose -f docker-compose.microservices.yml logs -f

# View last 100 lines
docker-compose -f docker-compose.microservices.yml logs --tail=100
```

## Development Tips

### 1. Hot Reloading

The frontend and some backend services support hot reloading:

- **Frontend**: Changes in `/frontend/src` automatically reload
- **User Service**: Changes in `/services/user-service/src` automatically reload
- **Mobile App**: Shake device or press Cmd+R (iOS) / R+R (Android) to reload

### 2. Database Management

Access databases directly:

```bash
# PostgreSQL
docker exec -it esports-nexus-postgres psql -U postgres

# MongoDB
docker exec -it esports-nexus-mongodb mongosh -u admin -p esportsNexusAdmin2024

# Redis
docker exec -it esports-nexus-redis redis-cli
```

### 3. API Testing

Test API endpoints:

```bash
# Health check
curl http://localhost:8000/health

# Get tournaments
curl http://localhost:8000/api/v1/tournaments

# Create user (example)
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"Test123!"}'
```

### 4. Rebuilding Services

If you make changes to service code:

```bash
# Rebuild specific service
docker-compose -f docker-compose.microservices.yml up -d --build user-service

# Rebuild all services
docker-compose -f docker-compose.microservices.yml up -d --build
```

### 5. Cleaning Up

```bash
# Stop all services
docker-compose -f docker-compose.microservices.yml down

# Stop and remove volumes (WARNING: Deletes all data)
docker-compose -f docker-compose.microservices.yml down -v

# Remove all Docker images
docker-compose -f docker-compose.microservices.yml down --rmi all
```

## Environment Variables

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_WS_URL=ws://localhost:8000
```

### Mobile App Configuration
Update `mobile/src/config/api.js` with appropriate endpoints.

### Backend Services
Each service has its own `.env.example` file in its directory. Copy and modify as needed:

```bash
cd services/user-service
cp .env.example .env
# Edit .env with your configuration
```

## Production Deployment

For production deployment, consider:

1. Using environment-specific docker-compose files
2. Implementing proper SSL/TLS certificates
3. Using managed databases (AWS RDS, Google Cloud SQL)
4. Implementing proper logging and monitoring
5. Setting up CI/CD pipelines
6. Using container orchestration (Kubernetes)

## Support

If you encounter issues:

1. Check the logs for error messages
2. Ensure all prerequisites are installed
3. Verify ports are not in use by other applications
4. Check Docker Desktop is running and has sufficient resources

For additional help, please refer to the project documentation or create an issue in the repository.

---

## Quick Commands Reference

```bash
# Start everything
docker-compose -f docker-compose.microservices.yml up -d

# Stop everything
docker-compose -f docker-compose.microservices.yml down

# View all logs
docker-compose -f docker-compose.microservices.yml logs -f

# Restart a specific service
docker-compose -f docker-compose.microservices.yml restart user-service

# Check service health
docker-compose -f docker-compose.microservices.yml ps

# Access web app
open http://localhost

# Access API gateway
open http://localhost:8000
```

Happy gaming! 🎮