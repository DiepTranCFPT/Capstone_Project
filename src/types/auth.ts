export interface User {
    id: number;
    name: string;
    email: string;
};

export interface AuthResponse {
    user: User;
    token: string;
};

export interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string,email: string, password: string) => Promise<void>;
    logout: () => void;
    forgotPassword: (email: string) => Promise<void>;
};