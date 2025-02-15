// hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '../store/userStore';
import { useEffect } from 'react';
import apiClient from '../apiClient';

// Define types
interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    image: string | null;
    role: string | null;
    password: string | null;
    created_at: string;
    updated_at: string;
}

// Function to get token from localStorage
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const fetchUsers = async (): Promise<User[]> => {
    const response = await apiClient.get('/api/back-office/users', {
        headers: getAuthHeaders(),
    });
    return response.data.data; // Extract the `data` array from the response
};

const createUser = async (formData: FormData): Promise<User> => {
    const response = await apiClient.post('/api/back-office/users', formData, {
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data.data;
};

const updateUser = async (userId: string, formData: FormData): Promise<User> => {
    const response = await apiClient.post(`/api/back-office/users/${userId}`, formData, {
        headers: {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data.data;
};

const deleteUser = async (id: string): Promise<string> => {
    await apiClient.delete(`/api/back-office/users/${id}`, {
        headers: getAuthHeaders(),
    });
    return id;
};

export const useUsers = () => {
    const queryClient = useQueryClient();
    const { setUsers } = useUserStore();

    // Fetch users with react-query
    const { data: users, isLoading, error } = useQuery({
        queryKey: ['users'],
        queryFn: fetchUsers,
    });

    // Update store when users change
    useEffect(() => {
        if (users) {
            setUsers(users);
        }
    }, [users, setUsers]);

    // Mutations
    const createMutation = useMutation({
        mutationFn: createUser,
        onSuccess: (data: User) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            useUserStore.getState().addUser(data);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ userId, formData }: { userId: string; formData: FormData }) => updateUser(userId, formData),
        onSuccess: (data: User) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            useUserStore.getState().updateUser(data);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteUser,
        onSuccess: (id: string) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            useUserStore.getState().deleteUser(id);
        },
    });

    return {
        users,
        isLoading,
        error,
        createUser: createMutation.mutate,
        updateUser: updateMutation.mutate,
        deleteUser: deleteMutation.mutate,
    };
};
