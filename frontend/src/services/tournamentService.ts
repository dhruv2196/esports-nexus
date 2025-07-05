import api from './api';
import { Tournament } from '../types';

export const tournamentService = {
  async getTournaments(status?: string, game?: string): Promise<Tournament[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (game) params.append('game', game);
    
    const response = await api.get(`/tournaments?${params.toString()}`);
    return response.data;
  },

  async getTournamentById(id: string): Promise<Tournament> {
    const response = await api.get(`/tournaments/${id}`);
    return response.data;
  },

  async createTournament(data: Partial<Tournament>): Promise<Tournament> {
    const response = await api.post('/tournaments', data);
    return response.data;
  },

  async updateTournament(id: string, data: Partial<Tournament>): Promise<Tournament> {
    const response = await api.put(`/tournaments/${id}`, data);
    return response.data;
  },

  async registerForTournament(tournamentId: string, teamId: string): Promise<void> {
    await api.post(`/tournaments/${tournamentId}/register`, null, {
      params: { teamId }
    });
  },

  async getUpcomingTournaments(): Promise<Tournament[]> {
    const response = await api.get('/tournaments/upcoming');
    return response.data;
  },

  async getMyTournaments(): Promise<Tournament[]> {
    const response = await api.get('/tournaments/my-tournaments');
    return response.data;
  }
};