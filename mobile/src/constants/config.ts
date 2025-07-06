import { API_BASE_URL, WS_URL, STRIPE_PUBLISHABLE_KEY } from '@env';

export const config = {
  api: {
    baseUrl: API_BASE_URL || 'http://localhost:8080',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  },
  
  websocket: {
    url: WS_URL || 'ws://localhost:8080',
    reconnectInterval: 5000,
    maxReconnectAttempts: 5,
  },
  
  stripe: {
    publishableKey: STRIPE_PUBLISHABLE_KEY || '',
  },
  
  storage: {
    keys: {
      authToken: '@auth_token',
      refreshToken: '@refresh_token',
      user: '@user',
      theme: '@theme',
      language: '@language',
      biometricEnabled: '@biometric_enabled',
      pushToken: '@push_token',
      onboardingCompleted: '@onboarding_completed',
    },
  },
  
  games: {
    valorant: {
      id: 'valorant',
      name: 'Valorant',
      icon: '🎮',
      color: '#ff4655',
    },
    bgmi: {
      id: 'bgmi',
      name: 'BGMI',
      icon: '🔫',
      color: '#f2a900',
    },
    codm: {
      id: 'codm',
      name: 'Call of Duty Mobile',
      icon: '💀',
      color: '#00a8e8',
    },
    freefire: {
      id: 'freefire',
      name: 'Free Fire',
      icon: '🔥',
      color: '#ff6b00',
    },
  },
  
  subscriptionPlans: {
    basic: {
      id: 'basic',
      name: 'Basic',
      price: 499, // in cents
      features: [
        'Basic stats tracking',
        'Join tournaments',
        'Create up to 5 teams',
        'Standard support',
      ],
    },
    pro: {
      id: 'pro',
      name: 'Pro',
      price: 999,
      features: [
        'Advanced analytics',
        'Priority matchmaking',
        'Create up to 20 teams',
        'AI-powered coaching',
        'Priority support',
      ],
    },
    premium: {
      id: 'premium',
      name: 'Premium',
      price: 1999,
      features: [
        'All Pro features',
        'Unlimited teams',
        'Custom tournaments',
        'API access',
        'Dedicated support',
        'Early access to features',
      ],
    },
  },
  
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
  
  validation: {
    username: {
      min: 3,
      max: 20,
      pattern: /^[a-zA-Z0-9_]+$/,
    },
    password: {
      min: 8,
      max: 128,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    },
    teamName: {
      min: 3,
      max: 50,
    },
    tournamentName: {
      min: 5,
      max: 100,
    },
  },
  
  notifications: {
    types: {
      TOURNAMENT_REMINDER: 'tournament_reminder',
      MATCH_STARTED: 'match_started',
      TEAM_INVITE: 'team_invite',
      PAYMENT_SUCCESS: 'payment_success',
      ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
    },
  },
  
  cache: {
    ttl: {
      user: 3600, // 1 hour
      tournaments: 300, // 5 minutes
      teams: 600, // 10 minutes
      stats: 1800, // 30 minutes
    },
  },
};