# Frontend UI - Microservices Integration Guide

This guide explains how the frontend UI is now integrated with the microservices architecture.

## Overview

The frontend has been updated to communicate with the microservices through the API Gateway instead of the monolithic backend. This provides better scalability, separation of concerns, and allows for independent service updates.

## Architecture

```
Frontend (React) 
    ↓
API Gateway (NGINX - Port 8000)
    ↓
Microservices:
- User Service (Port 3000) - Authentication & User Management
- Tournament Service (Port 8081) - Tournament Management
- Game Integration (Port 5000) - Game API Integrations
- AI Service (Port 5001) - Analytics & Predictions
- Payment Service (Port 8083) - Payment Processing
```

## New Features Added

### 1. **Enhanced Dashboard** (`/dashboard`)
- Real-time statistics overview
- Active tournaments display
- Recent match history
- Payment history
- AI-powered insights
- Quick actions for tournament creation

### 2. **Player Search** (`/players`)
- Search players across multiple games (PUBG, LoL, Valorant)
- View detailed player statistics
- AI-powered performance insights
- Match history analysis
- Platform-specific searches

### 3. **Tournament Creation** (`/tournaments/create`)
- Multi-step tournament creation wizard
- Support for different bracket types
- Prize pool configuration
- Custom rules setup
- Date/time scheduling

### 4. **Service Integration**

#### API Configuration (`src/config/api.config.ts`)
- Centralized API endpoint management
- WebSocket configuration for real-time updates
- Service-specific endpoint definitions

#### Updated Services:
- **authService.ts** - Handles authentication with both legacy and new endpoints
- **tournamentService.ts** - Full tournament management with WebSocket support
- **gameService.ts** - Game integrations (PUBG, Riot Games)
- **aiService.ts** - AI analytics and predictions
- **paymentService.ts** - Stripe payment integration

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install

# Install Material-UI dependencies
./install-mui.sh
```

### 2. Configure Environment

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_GATEWAY_URL=http://localhost:8000
REACT_APP_BACKEND_URL=http://localhost:8080
REACT_APP_WS_URL=ws://localhost:8000
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
```

### 3. Start the Frontend

```bash
npm start
```

The application will be available at `http://localhost:3000`

## API Endpoints

All API requests go through the API Gateway at `http://localhost:8000`. The gateway routes requests to the appropriate microservice.

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/users/profile` - Get user profile

### Tournaments
- `GET /api/v1/tournaments` - List tournaments
- `POST /api/v1/tournaments` - Create tournament
- `GET /api/v1/tournaments/:id` - Get tournament details
- `POST /api/v1/tournaments/:id/register` - Register team
- `WS /api/v1/tournaments/:id/live` - Live tournament updates

### Game Integration
- `GET /api/v1/games` - List supported games
- `POST /api/v1/games/players/search` - Search players
- `GET /api/v1/games/players/:platform/:playerId` - Get player stats

### AI Analytics
- `POST /api/v1/ai/predictions` - Get match predictions
- `GET /api/v1/ai/players/:playerId/insights` - Get player insights
- `GET /api/v1/ai/teams/:teamId/analysis` - Get team analysis

### Payments
- `POST /api/v1/payments/create-intent` - Create payment intent
- `GET /api/v1/payments/history` - Get payment history
- `POST /api/v1/subscriptions` - Create subscription

## Key UI Components

### Dashboard Component
- Located at: `src/pages/Dashboard/Dashboard.tsx`
- Features tabbed interface for tournaments, matches, analytics, and payments
- Real-time data updates
- Responsive design with Material-UI

### Player Search Component
- Located at: `src/pages/PlayerSearch/PlayerSearch.tsx`
- Multi-game player search
- Detailed statistics display
- AI insights integration

### Tournament Creation Component
- Located at: `src/pages/Tournaments/CreateTournament.tsx`
- Step-by-step wizard
- Form validation
- Date/time picker integration

## WebSocket Integration

The tournament service supports WebSocket connections for real-time updates:

```typescript
const ws = tournamentService.connectToTournamentLive(tournamentId, {
  onMessage: (data) => {
    // Handle live updates
    console.log('Live update:', data);
  },
  onError: (error) => {
    console.error('WebSocket error:', error);
  }
});
```

## Error Handling

All services include comprehensive error handling:
- Network errors are caught and displayed to users
- 401 errors trigger automatic logout
- Service-specific errors show appropriate messages

## Theme Configuration

The app uses Material-UI with a custom dark theme:
- Primary color: #a259ff (Purple)
- Secondary color: #ff6b6b (Red)
- Dark background with glassmorphism effects

## Development Tips

1. **Hot Reloading**: The frontend supports hot reloading for rapid development
2. **TypeScript**: All new components use TypeScript for better type safety
3. **Service Mocking**: You can mock service responses for testing
4. **Browser DevTools**: Use React DevTools and Redux DevTools for debugging

## Troubleshooting

### CORS Issues
If you encounter CORS errors:
1. Ensure the API Gateway is running
2. Check that CORS headers are properly configured in nginx
3. Use `withCredentials: true` in axios config

### WebSocket Connection Failed
1. Check if the API Gateway is running
2. Verify WebSocket proxy configuration in nginx
3. Ensure the tournament service is running

### Authentication Issues
1. Check JWT token in localStorage
2. Verify the backend service is running
3. Check for JWT secret configuration issues

## Future Enhancements

- [ ] Real-time notifications system
- [ ] Advanced tournament bracket visualization
- [ ] Live streaming integration
- [ ] Mobile-responsive improvements
- [ ] Progressive Web App (PWA) support
- [ ] Internationalization (i18n)

## Contributing

When adding new features:
1. Create services in `src/services/`
2. Add API endpoints to `src/config/api.config.ts`
3. Use Material-UI components for consistency
4. Follow the existing TypeScript patterns
5. Add proper error handling

---

For more information, see the main [RUNNING_GUIDE.md](../RUNNING_GUIDE.md)