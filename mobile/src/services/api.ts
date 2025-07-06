import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '@constants/config';
import { store } from '@store/index';
import { refreshAuthToken, logout } from '@store/slices/authSlice';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: config.api.baseUrl,
      timeout: config.api.timeout,
      headers: config.api.headers,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('@auth_token');
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(() => {
              return this.client(originalRequest);
            }).catch((err) => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            await store.dispatch(refreshAuthToken()).unwrap();
            
            this.processQueue(null);
            return this.client(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError);
            store.dispatch(logout());
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: any) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve();
      }
    });
    
    this.failedQueue = [];
  }

  // HTTP methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // File upload
  async uploadFile<T>(url: string, file: any, onProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }
}

export const apiClient = new ApiClient();

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: '/api/v1/auth/login',
    register: '/api/v1/auth/register',
    logout: '/api/v1/auth/logout',
    refresh: '/api/v1/auth/refresh',
    verify: '/api/v1/auth/verify',
    forgotPassword: '/api/v1/auth/forgot-password',
    resetPassword: '/api/v1/auth/reset-password',
  },
  
  // User
  user: {
    profile: '/api/v1/users/me',
    updateProfile: '/api/v1/users/me',
    uploadAvatar: '/api/v1/users/me/avatar',
    stats: '/api/v1/users/me/stats',
    teams: '/api/v1/users/me/teams',
    tournaments: '/api/v1/users/me/tournaments',
  },
  
  // Games
  games: {
    list: '/api/v1/games',
    stats: (gameId: string, playerName: string) => 
      `/api/v1/games/${gameId}/stats/${playerName}`,
    link: (gameId: string) => `/api/v1/games/${gameId}/link`,
  },
  
  // Tournaments
  tournaments: {
    list: '/api/v1/tournaments',
    create: '/api/v1/tournaments',
    details: (id: string) => `/api/v1/tournaments/${id}`,
    update: (id: string) => `/api/v1/tournaments/${id}`,
    delete: (id: string) => `/api/v1/tournaments/${id}`,
    register: (id: string) => `/api/v1/tournaments/${id}/register`,
    bracket: (id: string) => `/api/v1/tournaments/${id}/bracket`,
    matches: (id: string) => `/api/v1/tournaments/${id}/matches`,
    updateMatch: (id: string, matchId: string) => 
      `/api/v1/tournaments/${id}/matches/${matchId}`,
  },
  
  // Teams
  teams: {
    create: '/api/v1/teams',
    list: '/api/v1/teams',
    details: (id: string) => `/api/v1/teams/${id}`,
    update: (id: string) => `/api/v1/teams/${id}`,
    delete: (id: string) => `/api/v1/teams/${id}`,
    invite: (id: string) => `/api/v1/teams/${id}/invite`,
    leave: (id: string) => `/api/v1/teams/${id}/leave`,
    recommendations: '/api/v1/ai/recommend-team',
  },
  
  // AI/ML
  ai: {
    recommendTeam: '/api/v1/ai/recommend-team',
    predictPerformance: '/api/v1/ai/predict-performance',
    analyzePlayer: '/api/v1/ai/analyze-player',
  },
  
  // Payments
  payments: {
    createIntent: '/api/v1/payments/create-payment-intent',
    confirm: '/api/v1/payments/confirm-payment',
    methods: '/api/v1/payments/payment-methods',
    history: '/api/v1/payments/history',
    subscriptions: {
      plans: '/api/v1/subscriptions/plans',
      create: '/api/v1/subscriptions/create',
      current: '/api/v1/subscriptions/current',
      update: '/api/v1/subscriptions/update',
      cancel: '/api/v1/subscriptions/cancel',
    },
    payouts: {
      request: '/api/v1/payouts/request',
      history: '/api/v1/payouts/history',
      balance: '/api/v1/payouts/wallet/balance',
    },
  },
  
  // Notifications
  notifications: {
    list: '/api/v1/notifications',
    markRead: (id: string) => `/api/v1/notifications/${id}/read`,
    markAllRead: '/api/v1/notifications/read-all',
    preferences: '/api/v1/notifications/preferences',
    registerToken: '/api/v1/notifications/register-token',
  },
};