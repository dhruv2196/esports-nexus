import api from './api';

export interface BgmiPlayer {
  id: string;
  name: string;
  shardId: string;
  matchIds?: string[];
}

export interface BgmiStats {
  roundsPlayed: number;
  wins: number;
  kills: number;
  deaths: number;
  assists: number;
  damageDealt: number;
  headshotKills: number;
  longestKill: number;
  timeSurvived: number;
  top10s: number;
}

export interface BgmiMatch {
  id: string;
  createdAt: string;
  duration: number;
  gameMode: string;
  mapName: string;
  matchType: string;
  participants: BgmiParticipant[];
}

export interface BgmiParticipant {
  id: string;
  name: string;
  playerId: string;
  kills: number;
  assists: number;
  damageDealt: number;
  winPlace: number;
  timeSurvived: number;
}

export const gameStatsService = {
  // Search for BGMI players
  async searchBgmiPlayers(playerName: string): Promise<BgmiPlayer[]> {
    const response = await api.get('/game-stats/bgmi/search', {
      params: { playerName }
    });
    return response.data.data || [];
  },

  // Get BGMI player stats
  async getBgmiPlayerStats(playerId: string) {
    const response = await api.get(`/game-stats/bgmi/player/${playerId}`);
    return response.data.data;
  },

  // Link BGMI account to user profile
  async linkBgmiAccount(playerName: string) {
    const response = await api.post('/game-stats/bgmi/link', { playerName });
    return response.data;
  },

  // Get user's BGMI stats
  async getMyBgmiStats() {
    const response = await api.get('/game-stats/bgmi/my-stats');
    return response.data.data;
  },

  // Get match details
  async getBgmiMatch(matchId: string): Promise<BgmiMatch> {
    const response = await api.get(`/game-stats/bgmi/match/${matchId}`);
    return response.data.data;
  },

  // Get player's recent matches
  async getPlayerMatches(playerId: string, limit: number = 5): Promise<BgmiMatch[]> {
    const response = await api.get(`/game-stats/bgmi/player/${playerId}/matches`, {
      params: { limit }
    });
    return response.data.data || [];
  }
};