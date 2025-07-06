import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient, API_ENDPOINTS } from '@services/api';
import { Game } from '@types/index';

interface GameState {
  games: Game[];
  selectedGame: Game | null;
  loading: boolean;
  error: string | null;
}

const initialState: GameState = {
  games: [],
  selectedGame: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchGames = createAsyncThunk(
  'games/fetchAll',
  async () => {
    const response = await apiClient.get<Game[]>(API_ENDPOINTS.games.list);
    return response;
  }
);

// Slice
const gameSlice = createSlice({
  name: 'games',
  initialState,
  reducers: {
    selectGame: (state, action: PayloadAction<Game>) => {
      state.selectedGame = action.payload;
    },
    clearSelectedGame: (state) => {
      state.selectedGame = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGames.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGames.fulfilled, (state, action) => {
        state.loading = false;
        state.games = action.payload;
      })
      .addCase(fetchGames.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch games';
      });
  },
});

export const { selectGame, clearSelectedGame } = gameSlice.actions;
export default gameSlice.reducer;