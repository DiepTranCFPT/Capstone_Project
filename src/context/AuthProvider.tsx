import { useState, useEffect } from "react";
import { forgotPasswordApi, loginApi, registerApi, resetPasswordApi } from "~/services/authService";
import type { User } from "~/types/auth";
import { AuthContext } from "./AuthContext";

interface AuthProviderProps {
    children: React.ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [initialLoading, setInitialLoading] = useState<boolean>(true);

    // Restore auth state from localStorage when component mounts
    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
                setIsAuthenticated(true);
            }
            setInitialLoading(false);
        };

        initializeAuth();
    }, []); const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const handleAuthResponse = (response: { user: User, token: string }) => {
        setUser(response.user);
        setToken(response.token);
        setIsAuthenticated(true);
        setError(null);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
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

    const resetPassword = async (token: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            await resetPasswordApi(token, password);
            console.log('Password has been reset successfully');
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
        localStorage.removeItem('user');
    };

    const spendTokens = (amount: number) => {
        if (user) {
            const newBalance = user.tokenBalance - amount;
            if (newBalance >= 0) {
                const updatedUser = { ...user, tokenBalance: newBalance };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
            } else {
                console.error("Not enough tokens");
            }
        }
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
                resetPassword,
                initialLoading,
                spendTokens,
            }}
        >
            {!initialLoading ? children : null}
        </AuthContext.Provider>
    )
};

export default AuthProvider;
