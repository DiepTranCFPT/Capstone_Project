
import type { AuthResponse, LoginApiResponse, JwtPayload } from "~/types/auth";
import axios from "../configs/axios";

// Helper function to decode JWT token
const decodeJWT = (token: string): JwtPayload | null => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding JWT token:', error);
        return null;
    }
};

// Helper function to map API roles to User role type
const mapRolesToUserRole = (roles: string[]): 'STUDENT' | 'TEACHER' | 'ADMIN' | 'TUTOR' | 'PARENT' => {
    if (roles.includes('ADMIN')) return 'ADMIN';
    if (roles.includes('TEACHER')) return 'TEACHER';
    if (roles.includes('TUTOR')) return 'TUTOR';
    if (roles.includes('PARENT')) return 'PARENT';
    return 'STUDENT'; // default to student
};

export const loginApi = async (email: string, password: string): Promise<AuthResponse> => {
    try {
        const response = await axios.post<LoginApiResponse>('/auth/token', { email, password });

        if (response.data.code !== 1000 && response.data.code !== 0) {
            throw new Error(response.data.message || 'Login failed');
        }

        const { token, authenticated, roles } = response.data.data;

        if (!authenticated || !token) {
            throw new Error('Authentication failed');
        }

        // Decode token to get user data
        const decodedToken = decodeJWT(token);

        if (!decodedToken) {
            throw new Error('Invalid token format');
        }

        // Extract user data from token
        const user = {
            id: decodedToken.userId || decodedToken.id || 0,
            firstName: decodedToken.firstName || '',
            lastName: decodedToken.lastName || '',
            email: decodedToken.email || email,
            imgUrl: decodedToken.imgUrl || decodedToken.avatar || '',
            dob: decodedToken.dob ? new Date(decodedToken.dob) : new Date(),
            role: mapRolesToUserRole(roles),
            tokenBalance: decodedToken.tokenBalance || 0,
        };

        return { user, token };
    } catch {
        // if (error instanceof Error) {
        //     throw error;
        // }
        throw new Error('Email or password is incorrect');
    }
};

/**
 * Gửi authorization code nhận được từ Google về backend để xác thực.
 * @param code The authorization code from Google.
 * @returns AuthResponse containing the system's JWT and user info.
 */
export const googleLoginApi = async (code: string): Promise<AuthResponse> => {
    try {
        // Endpoint yêu cầu `code` là một query parameter
        const response = await axios.post<AuthResponse>(`/auth/outbound/authentication?code=${code}`);
        return response.data;
    } catch {
        throw new Error('Google authentication failed');
    }
};

export const registerApi = async (email: string, password: string, firstName: string, lastName: string, dob: Date): Promise<AuthResponse> => {
    try {
        const response = await axios.post<AuthResponse>('/users', { email, password, firstName, lastName, dob });
        return response.data;
    } catch {
        throw new Error('Registration failed');
    }
};

export const forgotPasswordApi = async (email: string): Promise<AuthResponse> => {
    try {
        const response = await axios.post<AuthResponse>('/auth/forgot-password', { email });
        return response.data;
    } catch {
        throw new Error('Password reset failed');
    }
};

export const changePasswordApi = async (currentPassword: string, newPassword: string, token: string): Promise<AuthResponse> => {
    try {
        const response = await axios.post<AuthResponse>('/auth/change-password', { currentPassword, newPassword, token });
        return response.data;
    } catch {
        throw new Error('Password reset failed');
    }
};

export const verifyEmailApi = async (email: string, token: string): Promise<AuthResponse> => {
    try {
        const response = await axios.post<AuthResponse>('auth/verify-email', { email, token });
        return response.data;
    } catch {
        throw new Error('Email verification failed');
    }
};

export const verifyOtpApi = async (email: string, otp: string, newPassword: string): Promise<AuthResponse> => {
    try {
        const response = await axios.post<AuthResponse>('auth/verify-otp', { email, otp, newPassword });
        return response.data;
    } catch {
        throw new Error('OTP verification failed');
    }
};

export const refreshTokenApi = async (token: string): Promise<AuthResponse> => {
    try {
        const response = await axios.post<AuthResponse>('auth/refresh-token', { token });
        return response.data;
    } catch {
        throw new Error('Token refresh failed');
    }
};
