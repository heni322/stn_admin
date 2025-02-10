import { useMutation, useQuery } from '@tanstack/react-query';
import apiClient from '../apiClient';
import { LoginCredentials, LoginResponse, User } from '@/types/auth';
import { AxiosResponse } from 'axios';

export const useLogin = () => {
  return useMutation<LoginResponse, Error, LoginCredentials>({
    mutationFn: async (credentials: LoginCredentials) => {
      const response: AxiosResponse<LoginResponse> = await apiClient.post('/api/login', credentials);
      return response.data;
    },
  });
};

export const useUser = () => {
  return useQuery<User, Error>({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await apiClient.get<User>('/auth/me');
      return response.data;
    },
    enabled: !!localStorage.getItem('token'),
  });
};
