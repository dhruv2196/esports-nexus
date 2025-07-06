// API Configuration for Microservices Architecture

// Use API Gateway for all requests
export const API_GATEWAY_URL = process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:8000';

// Service endpoints (all routed through API Gateway)
export const API_ENDPOINTS = {
  // Auth Service (User Service)
  auth: {
    login: '/api/v1/auth/login',
    register: '/api/v1/auth/register',
    logout: '/api/v1/auth/logout',
    refresh: '/api/v1/auth/refresh',
    profile: '/api/v1/users/profile',
    updateProfile: '/api/v1/users/profile',
  },
  
  // Tournament Service
  tournaments: {
    list: '/api/v1/tournaments',
    create: '/api/v1/tournaments',
    get: (id: string) => `/api/v1/tournaments/${id}`,
    update: (id: string) => `/api/v1/tournaments/${id}`,
    delete: (id: string) => `/api/v1/tournaments/${id}`,
    register: (id: string) => `/api/v1/tournaments/${id}/register`,
    bracket: (id: string) => `/api/v1/tournaments/${id}/bracket`,
    matches: (id: string) => `/api/v1/tournaments/${id}/matches`,
    updateMatch: (id: string, matchId: string) => `/api/v1/tournaments/${id}/matches/${matchId}`,
    // WebSocket endpoint for live updates
    live: (id: string) => `/api/v1/tournaments/${id}/live`,
  },
  
  // Game Integration Service
  games: {
    list: '/api/v1/games',
    stats: '/api/v1/games/stats',
    playerSearch: '/api/v1/games/players/search',
    playerStats: (platform: string, playerId: string) => `/api/v1/games/players/${platform}/${playerId}`,
    matchHistory: (platform: string, playerId: string) => `/api/v1/games/players/${platform}/${playerId}/matches`,
  },
  
  // AI Service
  ai: {
    predictions: '/api/v1/ai/predictions',
    analysis: '/api/v1/ai/analysis',
    recommendations: '/api/v1/ai/recommendations',
    playerInsights: (playerId: string) => `/api/v1/ai/players/${playerId}/insights`,
    teamAnalysis: (teamId: string) => `/api/v1/ai/teams/${teamId}/analysis`,
  },
  
  // Payment Service
  payments: {
    createPaymentIntent: '/api/v1/payments/create-intent',
    confirmPayment: '/api/v1/payments/confirm',
    history: '/api/v1/payments/history',
    subscriptions: {
      list: '/api/v1/subscriptions',
      create: '/api/v1/subscriptions',
      cancel: (id: string) => `/api/v1/subscriptions/${id}/cancel`,
    },
    payouts: {
      request: '/api/v1/payouts/request',
      list: '/api/v1/payouts',
      status: (id: string) => `/api/v1/payouts/${id}`,
    },
  },
  
  // Legacy endpoints (still using monolith backend)
  legacy: {
    auth: {
      signin: 'http://localhost:8080/api/auth/signin',
      signup: 'http://localhost:8080/api/auth/signup',
    },
  },
};

// WebSocket configuration
export const WS_ENDPOINTS = {
  tournaments: `ws://localhost:8000/api/v1/tournaments`,
  notifications: `ws://localhost:8000/api/v1/notifications`,
};

// Helper function to build full URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_GATEWAY_URL}${endpoint}`;
};

// Helper function to build WebSocket URL
export const buildWsUrl = (endpoint: string): string => {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = API_GATEWAY_URL.replace(/^https?:\/\//, '');
  return `${wsProtocol}//${host}${endpoint}`;
};