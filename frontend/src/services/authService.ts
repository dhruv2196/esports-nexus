import api from './api';
import { AuthResponse, User } from '../types';

export const authService = {
  async login(usernameOrEmail: string, password: string): Promise<AuthResponse> {
    const response = await api.post('/auth/signin', { usernameOrEmail, password });
    return response.data;
  },

  async register(username: string, email: string, password: string, displayName: string): Promise<AuthResponse> {
    const response = await api.post('/auth/signup', { username, email, password, displayName });
    return response.data;
  },

  async validateToken(token: string): Promise<User> {
    const response = await api.get('/auth/validate', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/users/me');
    return response.data;
  },

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    const response = await api.put(`/users/${userId}`, data);
    return response.data;
  }
};