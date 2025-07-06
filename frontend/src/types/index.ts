export interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  gamingIds?: Record<string, string>;
  gameStats?: Record<string, GameStats>;
  favoriteGames?: string[];
}

export interface GameStats {
  matchesPlayed: number;
  wins: number;
  kills: number;
  deaths: number;
  kd: number;
  winRate: number;
  rank?: string;
  level?: number;
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  game: string;
  organizerId: string;
  bannerImage?: string;
  type: 'SOLO' | 'DUO' | 'SQUAD' | 'CUSTOM';
  status: 'UPCOMING' | 'REGISTRATION_OPEN' | 'REGISTRATION_CLOSED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  maxTeams: number;
  teamSize: number;
  registeredTeamIds: string[];
  registrationStartDate: string;
  registrationEndDate: string;
  startDate: string;
  endDate: string;
  rules: string;
  format: string;
  prizePool?: PrizePool;
  createdAt: string;
  updatedAt: string;
}

export interface PrizePool {
  totalAmount: number;
  currency: string;
  distribution: Record<number, number>;
  additionalPrizes?: string[];
}

export interface Team {
  id: string;
  name: string;
  tag: string;
  logo?: string;
  banner?: string;
  description: string;
  captainId: string;
  memberIds: string[];
  maxMembers: number;
  games: string[];
  primaryGame: string;
  recruiting: boolean;
  lookingForRoles?: string[];
  recruitmentMessage?: string;
  stats?: TeamStats;
}

export interface TeamStats {
  tournamentsPlayed: number;
  tournamentsWon: number;
  matchesPlayed: number;
  matchesWon: number;
  winRate: number;
  currentRanking?: number;
}

export interface LiveMatch {
  id: string;
  title: string;
  game: string;
  tournamentId?: string;
  description?: string;
  streamUrl: string;
  platform: 'YOUTUBE' | 'TWITCH' | 'FACEBOOK' | 'CUSTOM';
  thumbnailUrl?: string;
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
  scheduledTime: string;
  startTime?: string;
  endTime?: string;
  teamIds?: string[];
  playerIds?: string[];
  viewerCount: number;
  chatEnabled: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  } | null;
}