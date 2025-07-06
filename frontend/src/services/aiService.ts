import api from './api';
import { API_ENDPOINTS } from '../config/api.config';

export interface PredictionRequest {
  matchId?: string;
  team1Id: string;
  team2Id: string;
  gameType: string;
}

export interface Prediction {
  matchId?: string;
  team1WinProbability: number;
  team2WinProbability: number;
  confidence: number;
  factors: {
    factor: string;
    impact: number;
    description: string;
  }[];
  generatedAt: Date;
}

export interface PlayerInsights {
  playerId: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  performanceTrend: 'improving' | 'stable' | 'declining';
  predictedRank: string;
  topChampions?: any[];
  playstyleAnalysis: {
    aggressive: number;
    defensive: number;
    supportive: number;
    objective_focused: number;
  };
}

export interface TeamAnalysis {
  teamId: string;
  teamName: string;
  overallRating: number;
  synergy: number;
  strengths: string[];
  weaknesses: string[];
  suggestedStrategies: string[];
  playerRoles: {
    playerId: string;
    suggestedRole: string;
    confidence: number;
  }[];
}

export const aiService = {
  // Get match predictions
  async getMatchPrediction(data: PredictionRequest): Promise<Prediction> {
    const response = await api.post(API_ENDPOINTS.ai.predictions, data);
    return response.data;
  },

  // Get detailed analysis
  async getMatchAnalysis(matchId: string): Promise<any> {
    const response = await api.post(API_ENDPOINTS.ai.analysis, { matchId });
    return response.data;
  },

  // Get recommendations
  async getRecommendations(type: 'player' | 'team', id: string): Promise<string[]> {
    const response = await api.post(API_ENDPOINTS.ai.recommendations, { type, id });
    return response.data.recommendations;
  },

  // Get player insights
  async getPlayerInsights(playerId: string): Promise<PlayerInsights> {
    const response = await api.get(API_ENDPOINTS.ai.playerInsights(playerId));
    return response.data;
  },

  // Get team analysis
  async getTeamAnalysis(teamId: string): Promise<TeamAnalysis> {
    const response = await api.get(API_ENDPOINTS.ai.teamAnalysis(teamId));
    return response.data;
  },

  // Generate team composition suggestions
  async getTeamCompositionSuggestions(playerIds: string[], gameType: string): Promise<any> {
    const response = await api.post(`${API_ENDPOINTS.ai.recommendations}/team-composition`, {
      playerIds,
      gameType
    });
    return response.data;
  },

  // Get performance predictions
  async getPerformancePrediction(playerId: string, timeframe: 'week' | 'month' | 'season'): Promise<any> {
    const response = await api.post(`${API_ENDPOINTS.ai.predictions}/performance`, {
      playerId,
      timeframe
    });
    return response.data;
  },

  // Get training recommendations
  async getTrainingRecommendations(playerId: string): Promise<{
    focusAreas: string[];
    exercises: {
      name: string;
      description: string;
      difficulty: 'easy' | 'medium' | 'hard';
      estimatedTime: number;
    }[];
    expectedImprovement: string;
  }> {
    const response = await api.get(`${API_ENDPOINTS.ai.playerInsights(playerId)}/training`);
    return response.data;
  }
};