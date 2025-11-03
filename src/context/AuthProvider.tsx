import { useState, useEffect, useCallback } from "react";
import { forgotPasswordApi, loginApi, registerApi, changePasswordApi, verifyEmailApi, verifyOtpApi, refreshTokenApi, googleLoginApi, getCurrentUserApi } from "../services/authService";
import type { User, AuthResponse, ChangePasswordRequest } from "../types/auth";
import { AuthContext } from "./AuthContext";
import { toast } from "../components/common/Toast";
import axios from "axios";

interface AuthProviderProps {
    children: React.ReactNode;
}

// Đặt khoảng thời gian làm mới token là 30 phút
const REFRESH_INTERVAL = 30 * 60 * 1000;

const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [initialLoading, setInitialLoading] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Hàm an toàn để lưu user vào localStorage
    const safelyStoreUser = (userToStore: User | null) => {
        if (userToStore) {
            localStorage.setItem('user', JSON.stringify(userToStore));
        } else {
            localStorage.removeItem('user');
        }
    };

    // Khôi phục trạng thái đăng nhập từ localStorage khi component được mount
    useEffect(() => {
        const initializeAuth = async () => {
            const storedToken = localStorage.getItem('token');

            if (storedToken && storedToken !== 'undefined') {
                // Validate token trước khi set authenticated
                try {
                    const userProfileResponse = await getCurrentUserApi();

                    // Token hợp lệ, set trạng thái authenticated
                    setToken(storedToken);
                    setIsAuthenticated(true);
                    setUser(userProfileResponse.user);
                    safelyStoreUser(userProfileResponse.user);

                } catch (error) {
                    console.error('Token validation failed on app initialization:', error);
                    // Token không hợp lệ, clear localStorage và redirect về login
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setIsAuthenticated(false);
                    setToken(null);
                    setUser(null);

                    // Redirect về trang login ngay lập tức
                    window.location.href = '/auth';
                    return; // Dừng thực hiện tiếp
                }
            } else {
                // Không có token, set trạng thái chưa authenticated
                setIsAuthenticated(false);
                setToken(null);
                setUser(null);
            }

            setInitialLoading(false);
        };

        initializeAuth();
    }, []);

    const handleAuthResponse = useCallback(async (response: AuthResponse, isRefreshing = false) => {
        if (response && response.token) {
            setToken(response.token);
            setIsAuthenticated(true);
            setError(null);
            localStorage.setItem('token', response.token);

            if (isRefreshing) {
                setUser(response.user);
                safelyStoreUser(response.user);
            } else {
                try {
                    const userProfileResponse = await getCurrentUserApi();
                    setUser(userProfileResponse.user);
                    safelyStoreUser(userProfileResponse.user);
                } catch (error) {
                    console.error('Failed to fetch user profile, using token data instead:', error);
                    setUser(response.user);
                    safelyStoreUser(response.user);
                    console.warn('Using user data from token due to API failure');
                }
            }
        }
    }, []);

    const updateAuthFromStorage = useCallback(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (storedToken && storedToken !== 'undefined') {
            setToken(storedToken);
            setIsAuthenticated(true);
            setError(null);
            if (storedUser && storedUser !== 'undefined') {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (error) {
                    console.error('Failed to parse stored user data in updateAuthFromStorage:', error);
                }
            }
        }
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }, []);

    const forceLogout = useCallback(() => {
        console.log('Forcing logout due to authentication failure');
        logout();
        toast.error('Session expired. Please login again.');
    }, [logout]);


    const refreshToken = useCallback(async (currentToken: string) => {
        console.log('Attempting to refresh token...');
        try {
            const response = await refreshTokenApi(currentToken);
            await handleAuthResponse(response, true);
            console.log('Token refreshed successfully.');
        } catch (err) {
            console.error('Token refresh failed:', err);
            throw err;
        }
    }, [handleAuthResponse]);

    // Hook useEffect để tự động làm mới token định kỳ
    useEffect(() => {
        let interval: NodeJS.Timeout | undefined;

        const handlePeriodicRefresh = async () => {
            const currentToken = localStorage.getItem('token');
            if (currentToken && currentToken !== 'undefined') {
                try {
                    console.log(`[${new Date().toLocaleTimeString()}] Automatically refreshing token...`);
                    await refreshToken(currentToken);
                } catch (error) {
                    console.error('Periodic token refresh failed. Logging out.', error);
                    forceLogout();
                }
            }
        };

        if (isAuthenticated) {
            console.log(`Setting up automatic token refresh every ${REFRESH_INTERVAL / 60000} minutes.`);
            interval = setInterval(handlePeriodicRefresh, REFRESH_INTERVAL);
        }

        return () => {
            if (interval) {
                console.log('Clearing automatic token refresh interval.');
                clearInterval(interval);
            }
        };
    }, [isAuthenticated, refreshToken, forceLogout]);


    const login = useCallback(async (email: string, password: string): Promise<string | null> => {
        setLoading(true);
        setError(null);
        try {
            const response = await loginApi(email, password);
            await handleAuthResponse(response, false);
            return null;
        } catch (err: unknown) {
            let errorMessage = 'Login failed';
            if (err instanceof Error) { errorMessage = err.message; }
            setError(errorMessage);
            return errorMessage;
        } finally {
            setLoading(false);
        }
    }, [handleAuthResponse]);

    const loginWithGoogle = useCallback(async (code: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await googleLoginApi(code);
            await handleAuthResponse(response, false);
        } catch (err: unknown) {
            if (err instanceof Error) { setError(err.message); }
            else { setError('Google login failed'); }
            throw err;
        } finally {
            setLoading(false);
        }
    }, [handleAuthResponse]);

    const register = useCallback(async (email: string, password: string, firstName: string, lastName: string, dob: Date) => {
        setLoading(true);
        setError(null);
        try {
            await registerApi(email, password, firstName, lastName, dob);
        } catch (err: unknown) {
            if (err instanceof Error) { setError(err.message); }
            else { setError('Registration failed'); }
        } finally {
            setLoading(false);
        }
    }, []);

    const forgotPassword = useCallback(async (email: string) => {
        setLoading(true);
        setError(null);
        try {
            await forgotPasswordApi(email);
        } catch (err: unknown) {
            if (err instanceof Error) { setError(err.message); }
            else { setError('Password reset failed'); }
        } finally {
            setLoading(false);
        }
    }, []);

    const changePassword = useCallback(async (changePassword: ChangePasswordRequest) => {
        setLoading(true);
        setError(null);
        try {
            await changePasswordApi(changePassword);
        } catch (err: unknown) {
            if (err instanceof Error) { setError(err.message); }
            else { setError('Password reset failed'); }
        } finally {
            setLoading(false);
        }
    }, []);

    const verifyEmail = useCallback(async (email: string, token: string) => {
        setLoading(true);
        setError(null);
        try {
            await verifyEmailApi(email, token);
        } catch (err: unknown) {
            console.error('Email verification failed:', {
                error: err,
                email,
                hasToken: !!token,
                axiosError: axios.isAxiosError(err) ? { status: err.response?.status, data: err.response?.data, url: err.config?.url } : undefined
            });
            if (err instanceof Error) { setError(err.message); }
            else { setError('Email verification failed'); }
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const verifyOtp = useCallback(async (email: string, otp: string, newPassword: string) => {
        setLoading(true);
        setError(null);
        try {
            await verifyOtpApi(email, otp, newPassword);
        } catch (err: unknown) {
            if (err instanceof Error) { setError(err.message); }
            else { setError('OTP verification failed'); }
        } finally {
            setLoading(false);
        }
    }, []);

    const spendTokens = useCallback((amount: number) => {
        setUser(currentUser => {
            if (currentUser) {
                const newBalance = currentUser.tokenBalance - amount;
                if (newBalance >= 0) {
                    const updatedUser = { ...currentUser, tokenBalance: newBalance };
                    safelyStoreUser(updatedUser);
                    return updatedUser;
                } else {
                    console.error("Not enough tokens");
                    return currentUser;
                }
            }
            return null;
        });
    }, []);


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
