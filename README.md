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

### 🎯 Gaming Integration
- **BGMI/PUBG PC Integration**: Real-time player stats, match history, and rankings
- **Multi-Region Support**: Search players across NA, EU, AS, SEA, OC, SA regions
- **Comprehensive Statistics**: K/D ratio, win rate, damage stats, and performance tracking
- **Smart Caching**: Efficient data caching to minimize API calls

### 🔐 Authentication & Security
- **Multiple Auth Methods**: Email/password, Google OAuth, Discord (planned)
- **JWT Security**: Secure token-based authentication
- **BCrypt Encryption**: Industry-standard password hashing
- **Role-Based Access**: Player, Team Captain, Tournament Organizer, Admin roles

### 🏆 Tournament System
- **Flexible Formats**: Single/Double elimination, Round robin, Swiss system
- **Live Updates**: Real-time bracket updates via WebSocket
- **Prize Management**: Secure prize pool tracking and distribution
- **Team Registration**: Easy team formation and management

### 💳 Payment & Subscriptions
- **Stripe Integration**: Secure payment processing
- **Subscription Tiers**: Free, Pro ($9.99/mo), Team ($29.99/mo)
- **Prize Pool Escrow**: Automated prize distribution
- **Multiple Payment Methods**: Cards, PayPal, Crypto (planned)

### 🤖 AI & Analytics
- **Performance Insights**: AI-powered gameplay analysis
- **Team Matching**: Intelligent team recommendations
- **Predictive Analytics**: Match outcome predictions
- **Training Suggestions**: Personalized improvement tips

### 💻 Modern Tech Stack
- **Microservices**: Node.js, Go, Python services
- **Frontend**: React 18, TypeScript, Framer Motion
- **Mobile**: React Native (iOS & Android)
- **Infrastructure**: Docker, Kubernetes, NGINX
- **Databases**: PostgreSQL, MongoDB, Redis
- **UI/UX**: Glassmorphism, Neon theme, Dark mode

### 📱 Cross-Platform
- **Responsive Web App**: Works on all devices
- **Native Mobile Apps**: iOS and Android support
- **Real-time Sync**: Data syncs across all platforms
- **Offline Mode**: Access key features without internet

**[View Complete Features List →](FEATURES.md)**

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/dhruv2196/esports-nexus.git
cd esports-nexus

# Quick start (checks prerequisites and starts all services)
./start.sh

# Or manually start all microservices
docker-compose -f docker-compose.microservices.yml up -d

# Check service health
docker-compose -f docker-compose.microservices.yml ps

# Stop all services
./stop.sh
```

Access the application at: http://localhost

**📖 For detailed setup instructions including mobile app setup, see the [Complete Running Guide](RUNNING_GUIDE.md)**

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

#### Mobile App Setup
See the [Complete Running Guide](RUNNING_GUIDE.md) for detailed mobile app instructions.

</details>

## 🏗️ Architecture

### Microservices Architecture

```
esports-nexus/
├── backend/                 # Legacy Spring Boot monolith (being migrated)
├── frontend/                # React TypeScript SPA
├── mobile/                  # React Native mobile app
├── services/                # Microservices
│   ├── user-service/        # Node.js - Authentication & user management
│   ├── tournament-service/  # Go - Tournament creation & management
│   ├── game-integration/    # Python - Game API integrations (PUBG, Riot)
│   ├── ai-service/          # Python - Analytics & predictions
│   └── payment-service/     # Node.js - Stripe payment processing
├── infrastructure/          # Docker & deployment configs
│   └── nginx/              # API Gateway configuration
├── k8s/                    # Kubernetes manifests
└── docker-compose.microservices.yml # Microservices environment
```

### Service Ports

| Service | Port | Technology |
|---------|------|------------|
| Frontend | 80 | React |
| API Gateway | 8000 | NGINX |
| User Service | 3000 | Node.js |
| Tournament Service | 8081 | Go |
| Game Integration | 5000 | Python |
| AI Service | 5001 | Python |
| Payment Service | 8083 | Node.js |
| PostgreSQL | 5432 | - |
| MongoDB | 27017 | - |
| Redis | 6379 | - |

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

- [Quick Features Reference](QUICK_FEATURES_REFERENCE.md) - **Quick overview of features by user type**
- [Complete Features List](FEATURES.md) - **Comprehensive list of all platform features**
- [Complete Running Guide](RUNNING_GUIDE.md) - **Start here!** Comprehensive setup for web and mobile
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

### ✅ Completed
- [x] BGMI/PUBG PC integration with stats tracking
- [x] JWT authentication with social login
- [x] Tournament creation and management
- [x] Microservices architecture migration
- [x] Payment integration (Stripe)
- [x] AI service for analytics
- [x] Mobile app foundation (React Native)
- [x] Real-time WebSocket updates
- [x] Advanced UI with glassmorphism

### 🔄 In Progress
- [ ] Mobile app completion and deployment
- [ ] Advanced tournament bracket visualization
- [ ] Discord OAuth integration
- [ ] Team voice chat integration

### 📅 Planned (2025)
- [ ] Support for more games (Valorant, CODM, Free Fire)
- [ ] In-app streaming capabilities
- [ ] Discord bot for notifications
- [ ] VR tournament viewing
- [ ] Blockchain prize distribution
- [ ] NFT player cards
- [ ] Esports betting (where legal)
- [ ] AI-powered coaching system

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