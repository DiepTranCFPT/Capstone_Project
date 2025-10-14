import { useState, useEffect } from "react";
import { forgotPasswordApi, loginApi, registerApi, changePasswordApi, verifyEmailApi, verifyOtpApi, refreshTokenApi, googleLoginApi, getCurrentUserApi } from "~/services/authService";
import type { User } from "~/types/auth";
import { AuthContext } from "./AuthContext";
import { toast } from "~/components/common/Toast";
import axios from "axios";

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

            if (storedToken) {
                setToken(storedToken);
                setIsAuthenticated(true);

                // Try to restore user data from localStorage first
                if (storedUser) {
                    try {
                        const parsedUser = JSON.parse(storedUser);
                        setUser(parsedUser);
                        console.log('User data restored from localStorage');
                    } catch (error) {
                        console.error('Failed to parse stored user data:', error);
                        // If parsing fails, try to fetch fresh data from API
                        try {
                            const userProfileResponse = await getCurrentUserApi();
                            setUser(userProfileResponse.user);
                            localStorage.setItem('user', JSON.stringify(userProfileResponse.user));
                        } catch (apiError) {
                            console.error('Failed to fetch user profile from API:', apiError);
                        }
                    }
                } else {
                    // No stored user data, fetch from API
                    try {
                        const userProfileResponse = await getCurrentUserApi();
                        setUser(userProfileResponse.user);
                        localStorage.setItem('user', JSON.stringify(userProfileResponse.user));
                    } catch (error) {
                        console.error('Failed to fetch user profile:', error);
                    }
                }
            }
            setInitialLoading(false);
        };

        initializeAuth();
    }, []);

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const handleAuthResponse = async (response: { user: User, token: string }) => {
        // Set initial auth state with token data
        setToken(response.token);
        setIsAuthenticated(true);
        setError(null);
        localStorage.setItem('token', response.token);

        try {
            // Fetch complete user profile from API /users/me
            const userProfileResponse = await getCurrentUserApi();
            // Update user state with complete profile data
            setUser(userProfileResponse.user);
            // Store user data in localStorage for persistence
            localStorage.setItem('user', JSON.stringify(userProfileResponse.user));
            console.log('User profile updated and stored in localStorage');
        } catch (error) {
            console.error('Failed to fetch user profile, using token data instead:', error);

            // Fallback to token data if API call fails
            setUser(response.user);
            // Still store the fallback user data
            localStorage.setItem('user', JSON.stringify(response.user));

            // Show warning but don't block login
            console.warn('Using user data from token due to API failure');
        }
    };

    // Method to update auth state when tokens are refreshed by axios interceptors
    const updateAuthFromStorage = () => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken) {
            setToken(storedToken);
            setIsAuthenticated(true);
            setError(null);

            // Restore user data if available
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                } catch (error) {
                    console.error('Failed to parse stored user data in updateAuthFromStorage:', error);
                }
            }
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
            console.log('Attempting to verify email:', { email, hasToken: !!token });
            await verifyEmailApi(email, token);
            console.log('Email has been verified successfully');
        } catch (err: unknown) {
            console.error('Email verification failed:', {
                error: err,
                email,
                hasToken: !!token,
                axiosError: axios.isAxiosError(err) ? {
                    status: err.response?.status,
                    data: err.response?.data,
                    url: err.config?.url
                } : undefined
            });

            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Email verification failed');
            }
            throw err; // Re-throw to allow component to handle
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
        localStorage.removeItem('user'); // Also remove user data
    };

    // Enhanced logout for handling auth failures
    const forceLogout = () => {
        console.log('Forcing logout due to authentication failure');
        // Clear localStorage manually before calling logout
        localStorage.removeItem('user');
        logout();
        // Show a toast notification to inform user
        toast.error('Session expired. Please login again.');
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
                forceLogout,
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
