import { useQuery } from '@tanstack/react-query';
import apiClient from '../apiClient';

export interface Category {
  id: string;
  name: string;
}

export const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/back-office/categories');
      return data ?? []; // Return empty array if data.data is undefined
    },
  });
};
