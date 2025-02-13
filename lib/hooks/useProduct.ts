// hooks/useProduct.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import apiClient from '../apiClient';

const API_URL = '/api/back-office/products'; // Replace with your API endpoint

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  site_id: string;
  category_id: string;
  images: { image_path: string; is_primary: boolean }[];
  variants: { size: string; color: string; price: number; stock: number }[];
}

export const useProducts = () => {
  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await apiClient.get(API_URL);
      return data.data;
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newProduct: Omit<Product, 'id'>) => {
      const { data } = await apiClient.post(API_URL, newProduct);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updatedProduct: Product) => {
      const { data } = await apiClient.put(`${API_URL}/${updatedProduct.id}`, updatedProduct);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`${API_URL}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
