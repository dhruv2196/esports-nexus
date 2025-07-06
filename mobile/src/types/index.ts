// User types
export interface User {
  id: string;
  username: string;
  email: string;
  profile: UserProfile;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  avatar?: string;
  bio?: string;
  country?: string;
  language?: string;
  favoriteGames?: string[];
  socialLinks?: SocialLinks;
}

export interface SocialLinks {
  discord?: string;
  twitter?: string;
  twitch?: string;
  youtube?: string;
}

// Game types
export interface Game {
  id: string;
  name: string;
  publisher: string;
  apiAvailable: boolean;
  regions: string[];
  icon?: string;
}

export interface PlayerStats {
  playerId: string;
  gameId: string;
  playerName: string;
  rank?: string;
  level?: number;
  stats: GameStats;
  lastUpdated: string;
}

export interface GameStats {
  kda?: number;
  winRate?: number;
  matchesPlayed?: number;
  kills?: number;
  deaths?: number;
  assists?: number;
  [key: string]: any;
}

// Tournament types
export interface Tournament {
  id: string;
  name: string;
  gameId: string;
  organizerId: string;
  bracketType: 'single_elim' | 'double_elim' | 'round_robin' | 'swiss';
  maxTeams: number;
  currentTeams: number;
  prizePoolCents: number;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  rules?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  tournamentId: string;
  name: string;
  captainId: string;
  members: string[];
  seed: number;
  status: 'registered' | 'checked_in' | 'eliminated' | 'winner';
  createdAt: string;
}

export interface Match {
  id: string;
  tournamentId: string;
  round: number;
  matchNumber: number;
  team1Id?: string;
  team2Id?: string;
  winnerId?: string;
  score?: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
}

// Payment types
export interface Payment {
  id: string;
  userId: string;
  amountCents: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  paymentMethod?: string;
  description?: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: 'basic' | 'pro' | 'premium';
  status: 'active' | 'cancelled' | 'past_due';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
}

// AI/ML types
export interface TeamRecommendation {
  recommendedPlayers: RecommendedPlayer[];
  chemistryScore: number;
  confidence: number;
}

export interface RecommendedPlayer {
  userId: string;
  username: string;
  chemistryScore: number;
  stats: GameStats;
  preferredRoles: string[];
}

export interface PerformancePrediction {
  winProbability: number;
  predictedScore: {
    kills: number;
    deaths: number;
    objectives: number;
  };
  keyFactors: string[];
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Onboarding: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Tournaments: undefined;
  Teams: undefined;
  Stats: undefined;
  Profile: undefined;
};

export type TournamentStackParamList = {
  TournamentList: undefined;
  TournamentDetails: { tournamentId: string };
  CreateTournament: undefined;
  TournamentBracket: { tournamentId: string };
};

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface CreateTournamentForm {
  name: string;
  gameId: string;
  bracketType: string;
  maxTeams: number;
  prizePool: number;
  startDate: Date;
  endDate: Date;
  rules: string;
}

// WebSocket types
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

export interface TournamentUpdate extends WebSocketMessage {
  type: 'tournament_created' | 'tournament_updated' | 'team_registered' | 'match_updated';
  tournamentId: string;
}

// Store types
export interface RootState {
  auth: AuthState;
  user: UserState;
  tournaments: TournamentState;
  teams: TeamState;
  games: GameState;
  notifications: NotificationState;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

export interface UserState {
  currentUser: User | null;
  profile: UserProfile | null;
  stats: PlayerStats[];
  loading: boolean;
  error: string | null;
}

export interface TournamentState {
  tournaments: Tournament[];
  currentTournament: Tournament | null;
  matches: Match[];
  loading: boolean;
  error: string | null;
}

export interface TeamState {
  teams: Team[];
  currentTeam: Team | null;
  recommendations: TeamRecommendation | null;
  loading: boolean;
  error: string | null;
}

export interface GameState {
  games: Game[];
  selectedGame: Game | null;
  loading: boolean;
  error: string | null;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  pushToken: string | null;
}