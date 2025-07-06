import api from './api';
import axios from 'axios';
import { AuthResponse, User } from '../types';
import { API_ENDPOINTS } from '../config/api.config';

export const authService = {
  // For now, use legacy auth endpoints until user service auth is ready
  async login(usernameOrEmail: string, password: string): Promise<AuthResponse> {
    // Using legacy endpoint temporarily
    const response = await axios.post(API_ENDPOINTS.legacy.auth.signin, { 
      usernameOrEmail, 
      password 
    });
    
    // Handle the backend's JwtAuthenticationResponse format
    if (response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
      
      // Transform the response to match our expected format
      return {
        success: true,
        message: 'Login successful',
        data: {
          token: response.data.accessToken,
          user: {
            id: response.data.userId || '',
            username: response.data.username || usernameOrEmail,
            email: response.data.email || usernameOrEmail,
            displayName: response.data.displayName || response.data.username || usernameOrEmail
          }
        }
      };
    }
    
    // If the response is already in the expected format
    if (response.data.success && response.data.data?.token) {
      localStorage.setItem('token', response.data.data.token);
      return response.data;
    }
    
    throw new Error('Invalid response format');
  },

  async register(username: string, email: string, password: string, displayName: string): Promise<AuthResponse> {
    // Using legacy endpoint temporarily
    const response = await axios.post(API_ENDPOINTS.legacy.auth.signup, { 
      username, 
      email, 
      password, 
      displayName 
    });
    
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
    }
    
    return response.data;
  },

  // New microservices endpoints
  async loginNew(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post(API_ENDPOINTS.auth.login, { email, password });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  },

  async registerNew(username: string, email: string, password: string): Promise<AuthResponse> {
    const response = await api.post(API_ENDPOINTS.auth.register, { 
      username, 
      email, 
      password 
    });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post(API_ENDPOINTS.auth.logout);
    } finally {
      localStorage.removeItem('token');
    }
  },

  async getCurrentUser(): Promise<User> {
    try {
      // Try the new endpoint first
      const response = await api.get(API_ENDPOINTS.auth.profile);
      return response.data;
    } catch (error) {
      // Fallback to backend endpoint
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      
      const response = await axios.get('http://localhost:8080/api/user/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Transform backend response to match User interface
      const userData = response.data;
      return {
        id: userData.id || userData._id || '',
        username: userData.username || '',
        email: userData.email || '',
        displayName: userData.displayName || userData.name || userData.username || '',
        avatar: userData.avatar || userData.profilePicture,
        bio: userData.bio,
        gamingIds: userData.gamingIds || {},
        gameStats: userData.gameStats || {},
        favoriteGames: userData.favoriteGames || []
      };
    }
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put(API_ENDPOINTS.auth.updateProfile, data);
    return response.data;
  },

  async refreshToken(): Promise<string> {
    const response = await api.post(API_ENDPOINTS.auth.refresh);
    const newToken = response.data.token;
    localStorage.setItem('token', newToken);
    return newToken;
  }
};