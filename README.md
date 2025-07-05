# Esports Nexus

A visually stunning, feature-rich Esports gaming platform where gamers can track their gameplay, watch live matches, participate in tournaments, fetch statistics and insights, interact with other players, and recruit teammates.

## Features

- **User Authentication**: Sign up/login with email or social accounts (Google, Discord)
- **Gameplay Tracking**: Connect BGMI account to fetch match history, stats, and highlights
- **Live Matches**: Watch live BGMI matches with integrated chat
- **Tournaments**: Browse, join, and create tournaments with real-time updates
- **Statistics & Insights**: Deep analytics with visual dashboards
- **Social & Community**: Forums, messaging, and team recruitment
- **Stunning UI**: Neon-themed dark UI with glassmorphism effects

## Tech Stack

### Backend
- Java with Spring Boot
- MongoDB for database
- JWT for authentication
- WebSocket for real-time features
- OAuth2 for social login

### Frontend
- React with TypeScript
- React Router for navigation
- Framer Motion for animations
- Axios for API calls
- React Icons for icons
- React Hot Toast for notifications

## Prerequisites

### For Local Development
- Java 17 or higher
- Maven 3.6+
- Node.js 16+
- MongoDB 4.4+

### For Docker Deployment
- Docker 20.10+
- Docker Compose 2.0+

## Setup Instructions

### Docker Deployment (Recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/esports-nexus.git
   cd esports-nexus
   ```

2. Copy the environment file and configure it:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. Deploy using the deployment script:
   ```bash
   # For development
   ./deploy.sh development up

   # For production
   ./deploy.sh production up
   ```

4. Check the health of services:
   ```bash
   ./health-check.sh
   ```

5. Access the application:
   - Development: http://localhost
   - Production: https://localhost (requires SSL certificates)

### Docker Commands

```bash
# Start services
./deploy.sh [development|production] up

# Stop services
./deploy.sh [development|production] down

# Restart services
./deploy.sh [development|production] restart

# View logs
./deploy.sh [development|production] logs

# Rebuild containers
./deploy.sh [development|production] build
```

### Manual Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Configure MongoDB connection in `src/main/resources/application.properties`:
   ```properties
   spring.data.mongodb.uri=mongodb://localhost:27017/esports_nexus
   ```

3. Set up OAuth2 credentials (optional):
   - Create apps on Google and Discord developer consoles
   - Add client IDs and secrets as environment variables:
     ```bash
     export GOOGLE_CLIENT_ID=your_google_client_id
     export GOOGLE_CLIENT_SECRET=your_google_client_secret
     export DISCORD_CLIENT_ID=your_discord_client_id
     export DISCORD_CLIENT_SECRET=your_discord_client_secret
     ```

4. Build and run the backend:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

   The backend will start on `http://localhost:8080`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (optional):
   ```env
   REACT_APP_API_URL=http://localhost:8080/api
   ```

4. Start the development server:
   ```bash
   npm start
   ```

   The frontend will start on `http://localhost:3000`

## Running the Application

1. Make sure MongoDB is running on your system
2. Start the backend server (port 8080)
3. Start the frontend development server (port 3000)
4. Open `http://localhost:3000` in your browser

## Default Credentials

For testing, you can create a new account through the registration page or use the API directly.

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login user
- `GET /api/auth/validate` - Validate JWT token

### Tournaments
- `GET /api/tournaments` - Get all tournaments
- `GET /api/tournaments/{id}` - Get tournament by ID
- `POST /api/tournaments` - Create tournament (authenticated)
- `PUT /api/tournaments/{id}` - Update tournament (authenticated)
- `POST /api/tournaments/{id}/register` - Register for tournament (authenticated)

## Project Structure

```
esports-nexus/
├── backend/                 # Java Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/esportsnexus/
│   │   │   │       ├── config/      # Configuration classes
│   │   │   │       ├── controller/  # REST controllers
│   │   │   │       ├── model/       # Domain models
│   │   │   │       ├── repository/  # MongoDB repositories
│   │   │   │       ├── service/     # Business logic
│   │   │   │       ├── security/    # Security configuration
│   │   │   │       └── dto/         # Data transfer objects
│   │   │   └── resources/
│   │   │       └── application.properties
│   └── pom.xml
├── frontend/                # React TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── contexts/        # React contexts
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── App.tsx         # Main app component
│   └── package.json
└── README.md
```

## Kubernetes Deployment

For production deployment on Kubernetes:

1. Update the image names in k8s manifests:
   ```bash
   cd k8s
   # Update image tags in backend.yaml and frontend.yaml
   ```

2. Create namespace and secrets:
   ```bash
   kubectl apply -f namespace.yaml
   # Update secrets in mongodb.yaml and backend.yaml with your base64 encoded values
   ```

3. Deploy all services:
   ```bash
   kubectl apply -f mongodb.yaml
   kubectl apply -f backend.yaml
   kubectl apply -f frontend.yaml
   kubectl apply -f ingress.yaml
   ```

4. Check deployment status:
   ```bash
   kubectl get all -n esports-nexus
   ```

## Production Considerations

### SSL Certificates
- For production, obtain SSL certificates and place them in the `ssl` directory
- Update nginx configuration with your domain name

### Environment Variables
- Never commit `.env` file with real credentials
- Use secrets management tools in production (AWS Secrets Manager, HashiCorp Vault, etc.)

### Scaling
- Backend and frontend are configured to run multiple replicas
- MongoDB should be configured as a replica set for production
- Consider using managed services (AWS RDS, MongoDB Atlas) for databases

### Monitoring
- Implement monitoring with Prometheus and Grafana
- Set up log aggregation with ELK stack or similar
- Configure alerts for critical services

## CI/CD Pipeline

The project includes GitHub Actions workflow for:
- Running tests on pull requests
- Building and pushing Docker images
- Deploying to staging/production environments

To use the CI/CD pipeline:
1. Set up Docker Hub account
2. Add secrets to GitHub repository:
   - `DOCKER_USERNAME`
   - `DOCKER_PASSWORD`
3. Configure deployment scripts in `.github/workflows/deploy.yml`

## Future Enhancements

- Support for more games (Valorant, CODM, etc.)
- In-app streaming capabilities
- Advanced AI-based team matching
- Esports news and content hub
- Mobile application
- Real-time notifications
- Advanced tournament brackets
- Payment integration for prize pools

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is licensed under the MIT License.