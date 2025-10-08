import { useState, useEffect } from "react";
import { forgotPasswordApi, loginApi, registerApi, changePasswordApi, verifyEmailApi, verifyOtpApi, refreshTokenApi, googleLoginApi } from "~/services/authService";
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

            if (storedToken) {
                setToken(storedToken);
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
    };

    // Method to update auth state when tokens are refreshed by axios interceptors
    const updateAuthFromStorage = () => {
        const storedToken = localStorage.getItem('token');

        if (storedToken) {
            setToken(storedToken);
            setIsAuthenticated(true);
            setError(null);
        }
    };

    const login = async (email: string, password: string): Promise<string | null> => {
        setLoading(true);
        setError(null); // Clear previous errors
        try {
            const response = await loginApi(email, password);
            handleAuthResponse(response);
            console.log(response);
            return null; // No error
        } catch (err: unknown) {
            let errorMessage = 'Login failed';
            if (err instanceof Error) {
                errorMessage = err.message;
            }
            setError(errorMessage);
            return errorMessage; // Return the error message
        } finally {
            setLoading(false);
        }
    };

    const loginWithGoogle = async (code: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await googleLoginApi(code);
            handleAuthResponse(response);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Google login failed');
            }
            // Ném lỗi ra ngoài để component gọi nó có thể xử lý (ví dụ: điều hướng về trang lỗi)
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const register = async (email: string, password: string, firstName: string, lastName: string, dob: Date) => {
        setLoading(true);
        setError(null);
        try {
            await registerApi(email, password, firstName, lastName, dob);
            // Don't automatically log in the user after registration
            // They need to verify their email first
            console.log('Registration successful. Please check your email for verification.');
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

    const changePassword = async (currentPassword: string, newPassword: string, token: string) => {
        setLoading(true);
        setError(null);
        try {
            await changePasswordApi(currentPassword, newPassword, token);
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

    const verifyEmail = async (email: string, token: string) => {
        setLoading(true);
        setError(null);
        try {
            await verifyEmailApi(email, token);
            console.log('Email has been verified successfully');
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Email verification failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async (email: string, otp: string, newPassword: string) => {
        setLoading(true);
        setError(null);
        try {
            await verifyOtpApi(email, otp, newPassword);
            console.log('OTP has been verified successfully');
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('OTP verification failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const refreshToken = async (token: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await refreshTokenApi(token);
            handleAuthResponse(response);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Token refresh failed');
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
                handleAuthResponse,
                updateAuthFromStorage,
                user,
                token,
                isAuthenticated,
                loading,
                error,
                login,
                loginWithGoogle,
                register,
                logout,
                forgotPassword,
                changePassword,
                verifyEmail,
                verifyOtp,
                refreshToken,
                initialLoading,
                spendTokens,
            }}
        >
            {!initialLoading ? children : null}
        </AuthContext.Provider>
    )
};

export default AuthProvider;
