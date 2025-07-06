import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient, API_ENDPOINTS } from '@services/api';
import { Tournament, Match } from '@types/index';

interface TournamentState {
  tournaments: Tournament[];
  currentTournament: Tournament | null;
  matches: Match[];
  loading: boolean;
  error: string | null;
}

const initialState: TournamentState = {
  tournaments: [],
  currentTournament: null,
  matches: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchTournaments = createAsyncThunk(
  'tournaments/fetchAll',
  async (params?: { status?: string; gameId?: string }) => {
    const response = await apiClient.get<Tournament[]>(
      API_ENDPOINTS.tournaments.list,
      { params }
    );
    return response;
  }
);

export const fetchTournamentDetails = createAsyncThunk(
  'tournaments/fetchDetails',
  async (tournamentId: string) => {
    const response = await apiClient.get<Tournament>(
      API_ENDPOINTS.tournaments.details(tournamentId)
    );
    return response;
  }
);

export const createTournament = createAsyncThunk(
  'tournaments/create',
  async (tournamentData: any) => {
    const response = await apiClient.post<Tournament>(
      API_ENDPOINTS.tournaments.create,
      tournamentData
    );
    return response;
  }
);

export const registerForTournament = createAsyncThunk(
  'tournaments/register',
  async ({ tournamentId, teamData }: { tournamentId: string; teamData: any }) => {
    const response = await apiClient.post(
      API_ENDPOINTS.tournaments.register(tournamentId),
      teamData
    );
    return response;
  }
);

export const fetchTournamentMatches = createAsyncThunk(
  'tournaments/fetchMatches',
  async (tournamentId: string) => {
    const response = await apiClient.get<Match[]>(
      API_ENDPOINTS.tournaments.matches(tournamentId)
    );
    return response;
  }
);

// Slice
const tournamentSlice = createSlice({
  name: 'tournaments',
  initialState,
  reducers: {
    clearTournamentData: (state) => {
      state.currentTournament = null;
      state.matches = [];
      state.error = null;
    },
    updateMatch: (state, action: PayloadAction<Match>) => {
      const index = state.matches.findIndex(
        (match) => match.id === action.payload.id
      );
      if (index >= 0) {
        state.matches[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch tournaments
    builder
      .addCase(fetchTournaments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTournaments.fulfilled, (state, action) => {
        state.loading = false;
        state.tournaments = action.payload;
      })
      .addCase(fetchTournaments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tournaments';
      });

    // Fetch tournament details
    builder
      .addCase(fetchTournamentDetails.fulfilled, (state, action) => {
        state.currentTournament = action.payload;
      });

    // Create tournament
    builder
      .addCase(createTournament.fulfilled, (state, action) => {
        state.tournaments.unshift(action.payload);
      });

    // Fetch matches
    builder
      .addCase(fetchTournamentMatches.fulfilled, (state, action) => {
        state.matches = action.payload;
      });
  },
});

export const { clearTournamentData, updateMatch } = tournamentSlice.actions;
export default tournamentSlice.reducer;