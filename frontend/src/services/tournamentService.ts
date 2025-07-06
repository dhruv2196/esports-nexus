import api from './api';
import axios from 'axios';
import { Tournament } from '../types';
import { API_ENDPOINTS, buildWsUrl } from '../config/api.config';

export interface CreateTournamentRequest {
  name: string;
  gameId: string;
  bracketType: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss';
  maxTeams: number;
  prizePoolCents: number;
  startDate: Date;
  endDate: Date;
  rules: string;
}

export interface RegisterTeamRequest {
  name: string;
  members: string[];
}

export interface UpdateMatchRequest {
  winnerId: string;
  score: string;
  status: 'scheduled' | 'in_progress' | 'completed';
}

export const tournamentService = {
  async getTournaments(status?: string, gameId?: string): Promise<Tournament[]> {
    try {
      // Try new microservices endpoint first
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (gameId) params.append('game_id', gameId);
      
      const response = await api.get(`${API_ENDPOINTS.tournaments.list}?${params.toString()}`);
      return response.data;
    } catch (error) {
      // Fallback to backend endpoint
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (gameId) params.append('gameId', gameId);
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8000/tournaments?${params.toString()}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      return response.data;
    }
  },

  async getTournamentById(id: string): Promise<Tournament> {
    const response = await api.get(API_ENDPOINTS.tournaments.get(id));
    return response.data;
  },

  async createTournament(data: CreateTournamentRequest): Promise<Tournament> {
    const response = await api.post(API_ENDPOINTS.tournaments.create, data);
    return response.data;
  },

  async updateTournament(id: string, data: Partial<CreateTournamentRequest>): Promise<Tournament> {
    const response = await api.put(API_ENDPOINTS.tournaments.update(id), data);
    return response.data;
  },

  async deleteTournament(id: string): Promise<void> {
    await api.delete(API_ENDPOINTS.tournaments.delete(id));
  },

  async registerTeam(tournamentId: string, team: RegisterTeamRequest): Promise<{ teamId: string; message: string }> {
    const response = await api.post(API_ENDPOINTS.tournaments.register(tournamentId), team);
    return response.data;
  },

  async getBracket(tournamentId: string): Promise<any> {
    const response = await api.get(API_ENDPOINTS.tournaments.bracket(tournamentId));
    return response.data;
  },

  async getMatches(tournamentId: string): Promise<any[]> {
    const response = await api.get(API_ENDPOINTS.tournaments.matches(tournamentId));
    return response.data;
  },

  async updateMatch(tournamentId: string, matchId: string, data: UpdateMatchRequest): Promise<void> {
    await api.put(API_ENDPOINTS.tournaments.updateMatch(tournamentId, matchId), data);
  },

  // WebSocket connection for live tournament updates
  connectToTournamentLive(tournamentId: string, handlers: {
    onOpen?: () => void;
    onMessage?: (data: any) => void;
    onError?: (error: Event) => void;
    onClose?: () => void;
  }): WebSocket {
    const wsUrl = buildWsUrl(API_ENDPOINTS.tournaments.live(tournamentId));
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Connected to tournament live updates');
      handlers.onOpen?.();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handlers.onMessage?.(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      handlers.onError?.(error);
    };

    ws.onclose = () => {
      console.log('Disconnected from tournament live updates');
      handlers.onClose?.();
    };

    return ws;
  }
};