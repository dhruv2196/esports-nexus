import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '@services/authService';
import { config } from '@constants/config';
import { LoginForm, RegisterForm, User } from '@types/index';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  refreshToken: null,
  user: null,
  loading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginForm) => {
    const response = await authService.login(credentials);
    
    // Store tokens
    await AsyncStorage.setItem(config.storage.keys.authToken, response.token);
    await AsyncStorage.setItem(config.storage.keys.refreshToken, response.refreshToken);
    await AsyncStorage.setItem(config.storage.keys.user, JSON.stringify(response.user));
    
    return response;
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterForm) => {
    const response = await authService.register(userData);
    
    // Store tokens
    await AsyncStorage.setItem(config.storage.keys.authToken, response.token);
    await AsyncStorage.setItem(config.storage.keys.refreshToken, response.refreshToken);
    await AsyncStorage.setItem(config.storage.keys.user, JSON.stringify(response.user));
    
    return response;
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    // Clear storage
    await AsyncStorage.multiRemove([
      config.storage.keys.authToken,
      config.storage.keys.refreshToken,
      config.storage.keys.user,
    ]);
    
    // Call logout API if needed
    await authService.logout();
  }
);

export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async () => {
    const token = await AsyncStorage.getItem(config.storage.keys.authToken);
    const userStr = await AsyncStorage.getItem(config.storage.keys.user);
    
    if (!token || !userStr) {
      throw new Error('No auth data found');
    }
    
    const user = JSON.parse(userStr);
    
    // Verify token with backend
    const isValid = await authService.verifyToken(token);
    
    if (!isValid) {
      throw new Error('Invalid token');
    }
    
    return { token, user };
  }
);

export const refreshAuthToken = createAsyncThunk(
  'auth/refresh',
  async () => {
    const refreshToken = await AsyncStorage.getItem(config.storage.keys.refreshToken);
    
    if (!refreshToken) {
      throw new Error('No refresh token found');
    }
    
    const response = await authService.refreshToken(refreshToken);
    
    // Update stored token
    await AsyncStorage.setItem(config.storage.keys.authToken, response.token);
    
    return response;
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      });
    
    // Register
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Registration failed';
      });
    
    // Logout
    builder
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.refreshToken = null;
        state.user = null;
        state.error = null;
      });
    
    // Check auth status
    builder
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
      });
    
    // Refresh token
    builder
      .addCase(refreshAuthToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
      })
      .addCase(refreshAuthToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.refreshToken = null;
        state.user = null;
      });
  },
});

export const { clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;