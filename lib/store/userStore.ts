// store/userStore.ts
import { create } from 'zustand';

type User = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    image: string | null;
    role: string | null;
    password: string | null;
    created_at: string;
    updated_at: string;
};

type UserStore = {
    users: User[];
    selectedUsers: User[];
    setUsers: (users: User[]) => void;
    setSelectedUsers: (users: User[]) => void;
    addUser: (user: User) => void;
    updateUser: (user: User) => void;
    deleteUser: (id: string) => void;
    deleteSelectedUsers: () => void;
};

export const useUserStore = create<UserStore>((set) => ({
    users: [],
    selectedUsers: [],
    setUsers: (users) => set({ users }),
    setSelectedUsers: (selectedUsers) => set({ selectedUsers }),
    addUser: (user) => set((state) => ({ users: [...state.users, user] })),
    updateUser: (user) =>
        set((state) => ({
            users: state.users.map((u) => (u.id === user.id ? user : u)),
        })),
    deleteUser: (id) =>
        set((state) => ({
            users: state.users.filter((u) => u.id !== id),
        })),
    deleteSelectedUsers: () =>
        set((state) => ({
            users: state.users.filter((u) => !state.selectedUsers.includes(u)),
            selectedUsers: [],
        })),
}));
