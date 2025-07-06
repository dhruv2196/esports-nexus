import { apiClient, API_ENDPOINTS } from './api';
import { LoginForm, RegisterForm, User } from '@types/index';

interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

interface TokenResponse {
  token: string;
}

class AuthService {
  async login(credentials: LoginForm): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.auth.login, credentials);
  }

  async register(userData: RegisterForm): Promise<AuthResponse> {
    const { confirmPassword, ...data } = userData;
    return apiClient.post<AuthResponse>(API_ENDPOINTS.auth.register, data);
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.auth.logout);
    } catch (error) {
      // Ignore logout errors
      console.log('Logout error:', error);
    }
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    return apiClient.post<TokenResponse>(API_ENDPOINTS.auth.refresh, { refreshToken });
  }

  async verifyToken(token: string): Promise<boolean> {
    try {
      await apiClient.post(API_ENDPOINTS.auth.verify, { token });
      return true;
    } catch (error) {
      return false;
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return apiClient.post(API_ENDPOINTS.auth.forgotPassword, { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return apiClient.post(API_ENDPOINTS.auth.resetPassword, { token, newPassword });
  }
}

export const authService = new AuthService();