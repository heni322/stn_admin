import axios from 'axios';
import { useAuthStore } from './store';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request Interceptor - Adds Authorization Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - Handles Unauthorized Requests
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('Unauthorized request. Logging out...');
      localStorage.removeItem('token');
      useAuthStore.getState().logout(); // Call Zustand's logout function
      window.location.href = '/auth/login'; // Redirect to login page
    }
    return Promise.reject(error);
  }
);

export default apiClient;
