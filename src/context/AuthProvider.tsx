import { useState } from "react";
import { forgotPasswordApi, loginApi, registerApi } from "~/services/authService";
import type { User } from "~/types/auth";
import { AuthContext } from "./AuthContext";

interface AuthProviderProps {
    children: React.ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const handleAuthResponse = (response: { user: User, token: string }) => {
        setUser(response.user);
        setToken(response.token);
        setIsAuthenticated(true);
        setError(null);
        localStorage.setItem('token', response.token);
    };

    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            const response = await loginApi(email, password);
            handleAuthResponse(response);
            console.log(response)
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Login failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const register = async (name: string, email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await registerApi(name, email, password);
            handleAuthResponse(response);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Registration failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const forgotPassword = async (email: string) => {
        setLoading(true);
        setError(null);
        try {
            await forgotPasswordApi(email);
            console.log('Password reset link sent to your email');
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Password reset failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated,
                loading,
                error,
                login,
                register,
                logout,
                forgotPassword,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
};

export default AuthProvider;
