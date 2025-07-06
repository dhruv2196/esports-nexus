import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient, API_ENDPOINTS } from '@services/api';
import { User, UserProfile, PlayerStats } from '@types/index';

interface UserState {
  currentUser: User | null;
  profile: UserProfile | null;
  stats: PlayerStats[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  profile: null,
  stats: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async () => {
    const response = await apiClient.get<User>(API_ENDPOINTS.user.profile);
    return response;
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData: Partial<UserProfile>) => {
    const response = await apiClient.put<User>(
      API_ENDPOINTS.user.updateProfile,
      profileData
    );
    return response;
  }
);

export const fetchUserStats = createAsyncThunk(
  'user/fetchStats',
  async () => {
    const response = await apiClient.get<PlayerStats[]>(API_ENDPOINTS.user.stats);
    return response;
  }
);

// Slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserData: (state) => {
      state.currentUser = null;
      state.profile = null;
      state.stats = [];
      state.error = null;
    },
    updateStats: (state, action: PayloadAction<PlayerStats>) => {
      const index = state.stats.findIndex(
        (stat) => stat.gameId === action.payload.gameId
      );
      if (index >= 0) {
        state.stats[index] = action.payload;
      } else {
        state.stats.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch profile
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.profile = action.payload.profile;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch profile';
      });

    // Update profile
    builder
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.profile = action.payload.profile;
      });

    // Fetch stats
    builder
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { clearUserData, updateStats } = userSlice.actions;
export default userSlice.reducer;