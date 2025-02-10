import { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';

interface AuthContextType {
    user: any;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any>(null);

    const login = async (email: string, password: string) => {
        try {
            const response = await axios.post('http://localhost:8000/api/login', { email, password });
            localStorage.setItem('token', response.data.token);
            setUser(response.data.user);
        } catch (error) {
            console.error('Login failed', error);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
