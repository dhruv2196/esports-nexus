import api from './api';
import { API_ENDPOINTS } from '../config/api.config';

export interface Game {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  active: boolean;
}

export interface PlayerSearchRequest {
  query: string;
  platform: 'pc' | 'xbox' | 'psn';
  region?: string;
}

export interface PlayerStats {
  playerId: string;
  playerName: string;
  platform: string;
  stats: {
    level?: number;
    kills?: number;
    deaths?: number;
    wins?: number;
    losses?: number;
    kd?: number;
    winRate?: number;
    [key: string]: any;
  };
  lastUpdated: Date;
}

export interface Match {
  matchId: string;
  gameMode: string;
  map: string;
  duration: number;
  startTime: Date;
  endTime: Date;
  placement?: number;
  kills?: number;
  deaths?: number;
  damage?: number;
  [key: string]: any;
}

export const gameService = {
  // Get list of supported games
  async getGames(): Promise<Game[]> {
    const response = await api.get(API_ENDPOINTS.games.list);
    return response.data;
  },

  // Get game statistics overview
  async getGameStats(): Promise<any> {
    const response = await api.get(API_ENDPOINTS.games.stats);
    return response.data;
  },

  // Search for players
  async searchPlayers(params: PlayerSearchRequest): Promise<any[]> {
    const response = await api.post(API_ENDPOINTS.games.playerSearch, params);
    return response.data;
  },

  // Get player statistics
  async getPlayerStats(platform: string, playerId: string): Promise<PlayerStats> {
    const response = await api.get(API_ENDPOINTS.games.playerStats(platform, playerId));
    return response.data;
  },

  // Get player match history
  async getPlayerMatchHistory(platform: string, playerId: string, limit: number = 20): Promise<Match[]> {
    const response = await api.get(API_ENDPOINTS.games.matchHistory(platform, playerId), {
      params: { limit }
    });
    return response.data;
  },

  // PUBG/BGMI specific methods
  pubg: {
    async searchPlayer(playerName: string, platform: 'steam' | 'kakao' | 'xbox' | 'psn' = 'steam'): Promise<any> {
      const response = await api.post(API_ENDPOINTS.games.playerSearch, {
        query: playerName,
        platform,
        game: 'pubg'
      });
      return response.data;
    },

    async getPlayerStats(playerId: string, platform: string = 'steam'): Promise<any> {
      const response = await api.get(API_ENDPOINTS.games.playerStats(platform, playerId));
      return response.data;
    },

    async getSeasonStats(playerId: string, seasonId: string, platform: string = 'steam'): Promise<any> {
      const response = await api.get(`${API_ENDPOINTS.games.playerStats(platform, playerId)}/seasons/${seasonId}`);
      return response.data;
    }
  },

  // Riot Games (League of Legends, Valorant) specific methods
  riot: {
    async getSummonerByName(summonerName: string, region: string = 'na1'): Promise<any> {
      const response = await api.post(API_ENDPOINTS.games.playerSearch, {
        query: summonerName,
        platform: region,
        game: 'lol'
      });
      return response.data;
    },

    async getMatchHistory(puuid: string, count: number = 20): Promise<any> {
      const response = await api.get(`/api/v1/games/riot/matches/${puuid}`, {
        params: { count }
      });
      return response.data;
    }
  }
};