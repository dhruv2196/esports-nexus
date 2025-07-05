# 🎮 Esports Nexus

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.1.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.2-blue.svg)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green.svg)](https://www.mongodb.com/)

A visually stunning, feature-rich esports gaming platform where gamers can track their gameplay, watch live matches, participate in tournaments, fetch statistics and insights, interact with other players, and recruit teammates.

**Created by**: [Dhruv Singhal](https://github.com/dhruv2196)  
**Repository**: [https://github.com/dhruv2196/esports-nexus](https://github.com/dhruv2196/esports-nexus)

## 🌟 Key Features

### 🎯 BGMI/PUBG Integration
- **Player Search**: Search for PUBG PC players across different regions
- **Statistics Tracking**: View detailed player statistics and match history
- **Malformed JSON Fix**: Robust error handling for PUBG API response issues
- **Caching**: Efficient caching mechanism to reduce API calls

### 🔐 Authentication & Security
- JWT-based authentication system
- Social login support (Google, Discord)
- Secure password hashing with BCrypt
- Role-based access control

### 🏆 Tournament Management
- Create and manage tournaments
- Real-time tournament updates via WebSocket
- Player registration and bracket management
- Prize pool tracking

### 💻 Modern Tech Stack
- **Backend**: Spring Boot 3.1.5, MongoDB, WebSocket
- **Frontend**: React 18, TypeScript, Framer Motion
- **DevOps**: Docker, Kubernetes, GitHub Actions
- **UI/UX**: Glassmorphism effects, Neon-themed dark UI

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/dhruv2196/esports-nexus.git
cd esports-nexus

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Start all services
./deploy.sh development up

# Check service health
./health-check.sh
```

Access the application at: http://localhost

### Manual Setup

<details>
<summary>Click to expand manual setup instructions</summary>

#### Backend Setup
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

#### Frontend Setup
```bash
cd frontend
npm install
npm start
```

</details>

## 🏗️ Architecture

```
esports-nexus/
├── backend/                 # Spring Boot REST API
│   ├── src/
│   │   └── main/
│   │       └── java/com/esportsnexus/
│   │           ├── config/      # Security, WebSocket, Cache configs
│   │           ├── controller/  # REST endpoints
│   │           ├── service/     # Business logic & PUBG API integration
│   │           └── model/       # MongoDB entities
│   └── Dockerfile
├── frontend/                # React TypeScript SPA
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   ├── services/       # API client services
│   │   └── contexts/       # React contexts (Auth)
│   └── Dockerfile
├── k8s/                    # Kubernetes manifests
├── docker-compose.yml      # Development environment
└── docker-compose.prod.yml # Production environment
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=your_secure_password
MONGO_DATABASE=esports_nexus

# JWT
JWT_SECRET=your_jwt_secret_key

# PUBG API (Optional)
PUBG_API_KEY=your_pubg_api_key

# OAuth2 (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### PUBG API Integration

The platform includes a robust PUBG API integration with special handling for malformed JSON responses:

```java
// Automatic fix for malformed JSON from PUBG API
private String fixMalformedJson(String json) {
    // Handles missing commas in JSON responses
    // Prevents parsing errors and application crashes
}
```

## 📦 Deployment

### GitHub Actions CI/CD

The repository includes a complete CI/CD pipeline. To enable:

1. Go to Settings → Secrets → Actions
2. Add the following secrets:
   - `DOCKER_USERNAME`
   - `DOCKER_PASSWORD`
   - `KUBE_CONFIG` (optional, for K8s deployment)

See [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md) for detailed instructions.

### Kubernetes Deployment

```bash
# Deploy to Kubernetes
kubectl apply -f k8s/

# Check deployment status
kubectl get all -n esports-nexus
```

## 🧪 Testing

### API Testing
```bash
# Test BGMI player search
./test-bgmi-api.js

# Run comprehensive API tests
./retest-bgmi-api.sh
```

### Test Reports
- [BGMI API Test Report](BGMI_API_TEST_REPORT.md)
- [SEA Player Test Report](SEA_PLAYER_TEST_REPORT.md)
- [Final Retest Report](FINAL_RETEST_REPORT.md)

## 📚 Documentation

- [BGMI API Integration Guide](BGMI_API_INTEGRATION.md)
- [Docker Deployment Guide](DOCKER_DEPLOYMENT_SUMMARY.md)
- [Docker Quick Start](DOCKER_QUICKSTART.md)
- [GitHub Actions Setup](GITHUB_ACTIONS_SETUP.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Known Issues

- PUBG API only supports PC platform players (mobile players cannot be searched)
- WebSocket connections may need reconnection handling in production environments

## 🚧 Roadmap

- [ ] Support for more games (Valorant, CODM, Free Fire)
- [ ] Mobile application (React Native)
- [ ] Advanced tournament bracket visualization
- [ ] In-app streaming capabilities
- [ ] AI-based team matching
- [ ] Payment integration for prize pools
- [ ] Discord bot integration
- [ ] Advanced analytics dashboard

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- PUBG API for providing player statistics
- Spring Boot community for excellent documentation
- React community for amazing UI libraries
- All contributors and testers

## 📞 Contact

**Dhruv Singhal** - [@dhruv2196](https://github.com/dhruv2196)

Project Link: [https://github.com/dhruv2196/esports-nexus](https://github.com/dhruv2196/esports-nexus)

---

<p align="center">Made with ❤️ for the gaming community</p>