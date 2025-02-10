import { create } from 'zustand';
import { User, AuthState } from '@/types/auth';
import apiClient from './apiClient';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    const response = await apiClient.post('/api/login', { email, password });
    const { token, user } = response.data;

    localStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
