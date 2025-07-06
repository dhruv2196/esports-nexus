import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient, API_ENDPOINTS } from '@services/api';
import { Team, TeamRecommendation } from '@types/index';

interface TeamState {
  teams: Team[];
  currentTeam: Team | null;
  recommendations: TeamRecommendation | null;
  loading: boolean;
  error: string | null;
}

const initialState: TeamState = {
  teams: [],
  currentTeam: null,
  recommendations: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchTeams = createAsyncThunk(
  'teams/fetchAll',
  async () => {
    const response = await apiClient.get<Team[]>(API_ENDPOINTS.teams.list);
    return response;
  }
);

export const fetchTeamDetails = createAsyncThunk(
  'teams/fetchDetails',
  async (teamId: string) => {
    const response = await apiClient.get<Team>(
      API_ENDPOINTS.teams.details(teamId)
    );
    return response;
  }
);

export const createTeam = createAsyncThunk(
  'teams/create',
  async (teamData: any) => {
    const response = await apiClient.post<Team>(
      API_ENDPOINTS.teams.create,
      teamData
    );
    return response;
  }
);

export const fetchTeamRecommendations = createAsyncThunk(
  'teams/fetchRecommendations',
  async (params: { gameId: string; preferredRoles: string[] }) => {
    const response = await apiClient.post<TeamRecommendation>(
      API_ENDPOINTS.teams.recommendations,
      params
    );
    return response;
  }
);

// Slice
const teamSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    clearTeamData: (state) => {
      state.currentTeam = null;
      state.recommendations = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch teams
    builder
      .addCase(fetchTeams.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = action.payload;
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch teams';
      });

    // Fetch team details
    builder
      .addCase(fetchTeamDetails.fulfilled, (state, action) => {
        state.currentTeam = action.payload;
      });

    // Create team
    builder
      .addCase(createTeam.fulfilled, (state, action) => {
        state.teams.unshift(action.payload);
        state.currentTeam = action.payload;
      });

    // Fetch recommendations
    builder
      .addCase(fetchTeamRecommendations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTeamRecommendations.fulfilled, (state, action) => {
        state.loading = false;
        state.recommendations = action.payload;
      })
      .addCase(fetchTeamRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to get recommendations';
      });
  },
});

export const { clearTeamData } = teamSlice.actions;
export default teamSlice.reducer;