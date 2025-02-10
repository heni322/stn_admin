// types/auth.ts
export interface User {
    id: string;
    email: string;
    role: 'Admin' | 'Client' | 'Provider';
  }

  export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
  }

  export interface LoginCredentials {
    email: string;
    password: string;
  }

  export interface LoginResponse {
    token: string;
    user: User;
  }
