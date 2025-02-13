import { useQuery } from '@tanstack/react-query';
import apiClient from '../apiClient';

export interface Site {
  id: string;
  name: string;
}

export const useSites = () => {
  return useQuery<Site[]>({
    queryKey: ['sites'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/back-office/sites');
      return data ?? []; // Return empty array if data.data is undefined
    },
  });
};
