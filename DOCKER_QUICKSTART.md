# Docker Quick Start Guide for Esports Nexus

## Prerequisites
- Docker Desktop installed and running
- Java 17+ (for local backend development)
- Node.js 16+ (for local frontend development)

## Quick Start Options

### Option 1: Run MongoDB with Docker, Applications Locally (Fastest)

1. **Start MongoDB only:**
   ```bash
   docker-compose -f docker-compose-simple.yml up -d
   ```

2. **Run Backend locally:**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

3. **Run Frontend locally:**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080/api
   - MongoDB: mongodb://localhost:27017

### Option 2: Full Docker Deployment (Takes longer first time)

1. **Ensure .env file exists:**
   ```bash
   cp .env.example .env
   ```

2. **Build and run all services:**
   ```bash
   ./deploy.sh development up
   ```

   Note: First build will take 5-10 minutes as it downloads all dependencies.

3. **Monitor the build progress:**
   ```bash
   docker-compose logs -f
   ```

## Troubleshooting

### If Docker build is slow:
- The first build downloads all Maven and npm dependencies
- Subsequent builds will use cached layers and be much faster
- Consider using Option 1 for faster development

### If build fails:
1. Check Docker Desktop is running
2. Ensure you have enough disk space
3. Try building services individually:
   ```bash
   docker-compose build mongodb
   docker-compose build backend
   docker-compose build frontend
   ```

### To clean up and start fresh:
```bash
docker-compose down -v
docker system prune -a
```

## Development Tips

1. **Hot Reload:** When running locally (Option 1), both backend and frontend support hot reload
2. **Database GUI:** Use MongoDB Compass to connect to `mongodb://admin:esportsNexusAdmin2024@localhost:27017`
3. **API Testing:** Backend runs on http://localhost:8080/api
4. **Health Check:** http://localhost:8080/api/actuator/health

## Next Steps

Once running, you can:
1. Register a new account at http://localhost:3000/register
2. Browse tournaments at http://localhost:3000/tournaments
3. Check the API documentation at http://localhost:8080/api/swagger-ui.html (if configured)