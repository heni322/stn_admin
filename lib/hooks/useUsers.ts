import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useUserStore } from '../store/userStore';
import { useEffect } from 'react';

// Define types
interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    image: string;
    role: string;
    // Add other user fields as needed
}

const fetchUsers = async (): Promise<User[]> => {
    const response = await axios.get('/api/back-office/users');
    return response.data;
};

const createUser = async (user: User): Promise<User> => {
    const response = await axios.post('/api/back-office/users', user);
    return response.data;
};

const updateUser = async (user: User): Promise<User> => {
    const response = await axios.post(`/api/back-office/users/${user.id}`, user);
    return response.data;
};

const deleteUser = async (id: string): Promise<string> => {
    await axios.delete(`/api/back-office/users/${id}`);
    return id;
};

export const useUsers = () => {
    const queryClient = useQueryClient();
    const { setUsers } = useUserStore();

    // Corrected useQuery implementation
    const { data: users, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: fetchUsers,
    });

    // Use useEffect to update store when users change
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
        mutationFn: updateUser,
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
        createUser: createMutation.mutate,
        updateUser: updateMutation.mutate,
        deleteUser: deleteMutation.mutate,
    };
};
