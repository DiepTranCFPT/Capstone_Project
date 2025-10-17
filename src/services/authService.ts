
import type {
    AuthResponse,
    LoginApiResponse,
    JwtPayload,
    User,
    EditProfileRequest,
    EditProfileResponse,
    UploadAvatarResponse,
    ChangePasswordRequest
} from "~/types/auth";
import axiosInstance, { publicAxios } from "../configs/axios";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;
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
const mapRolesToUserRole = (roles: string[]): 'STUDENT' | 'TEACHER' | 'ADMIN' | 'ACADEMIC_ADVISOR' | 'PARENT' => {
    if (roles === null || roles.length === 0) return 'STUDENT'; // default to student if roles is null or empty
    if (roles.includes('ADMIN')) return 'ADMIN';
    if (roles.includes('TEACHER')) return 'TEACHER';
    if (roles.includes('ACADEMIC_ADVISOR')) return 'ACADEMIC_ADVISOR';
    if (roles.includes('PARENT')) return 'PARENT';
    return 'STUDENT'; // default to student
};

export const loginApi = async (email: string, password: string): Promise<AuthResponse> => {
    try {
        const response = await axiosInstance.post<LoginApiResponse>('/auth/token', { email, password });

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
    } catch (error: unknown) {
        console.error('Login API Error Details:', {
            error,
            response: axios.isAxiosError(error) ? error.response : undefined,
            message: error instanceof Error ? error.message : 'Unknown error'
        });

        if (axios.isAxiosError(error) && error.response) {
            // Handle specific API error responses
            const responseData = error.response.data;
            if (responseData && responseData.message) {
                throw new Error(responseData.message);
            }
            if (responseData && responseData.error) {
                throw new Error(responseData.error);
            }
            // Handle different HTTP status codes
            switch (error.response.status) {
                case 400:
                    throw new Error('Invalid login credentials');
                case 401:
                    throw new Error('Unauthorized access');
                case 403:
                    throw new Error('Access forbidden');
                case 404:
                    throw new Error('Login service not found');
                case 429:
                    throw new Error('Too many login attempts. Please try again later');
                case 500:
                    throw new Error('Server error. Please try again later');
                default:
                    throw new Error(`Login failed (${error.response.status})`);
            }
        }

        if (error instanceof Error) {
            throw error;
        }

        throw new Error('Network error. Please check your connection and try again');
    }
};

/**
 * Cập nhật thông tin profile của user hiện tại
 * @param profileData - Dữ liệu profile cần cập nhật
 * @returns Promise với thông tin user đã được cập nhật
 */
export const updateProfileApi = async (profileData: EditProfileRequest): Promise<User> => {
    try {
        const response = await axiosInstance.put<EditProfileResponse>('/users/me', profileData);

        if (response.data.code !== 1000) {
            throw new Error(response.data.message || 'Failed to update profile');
        }

        const userData = response.data.data;

        // Map API response to User object
        const user: User = {
            id: parseInt(userData.id.toString()) || 0,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            imgUrl: userData.imgUrl || '',
            dob: new Date(userData.dob),
            role: mapRolesToUserRole(userData.roles || []),
            tokenBalance: userData.tokenBalance || 0,
        };

        return user;
    } catch (error: unknown) {
        console.error('Update Profile API Error Details:', {
            error,
            response: axios.isAxiosError(error) ? error.response : undefined,
            message: error instanceof Error ? error.message : 'Unknown error'
        });

        if (axios.isAxiosError(error) && error.response) {
            const responseData = error.response.data;
            if (responseData && responseData.message) {
                throw new Error(responseData.message);
            }
            if (responseData && responseData.error) {
                throw new Error(responseData.error);
            }

            // Handle specific errors for update profile
            switch (error.response.status) {
                case 400:
                    throw new Error('Invalid profile data provided');
                case 401:
                    throw new Error('Unauthorized access to update profile');
                case 404:
                    throw new Error('User profile not found');
                case 429:
                    throw new Error('Too many requests. Please try again later');
                case 500:
                    throw new Error('Server error. Please try again later');
                default:
                    throw new Error(`Failed to update profile (${error.response.status})`);
            }
        }

        if (error instanceof Error) {
            throw error;
        }

        throw new Error('Network error. Please check your connection and try again');
    }
};

/**
 * Upload avatar cho user hiện tại
 * @param file - File ảnh cần upload
 * @returns Promise với URL của ảnh đã upload
 */
export const uploadAvatarApi = async (file: File): Promise<string> => {
    try {
        const formData = new FormData();
        // Ensure filename is included for better backend compatibility
        formData.append('file', file, file.name);

        // Lấy token từ localStorage để gửi kèm request
        const token = localStorage.getItem('token');

        console.log('Upload Avatar Debug Info:', {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            hasToken: !!token,
            endpoint: '/users/me/avatar'
        });

        const response = await axios.post<UploadAvatarResponse>(
            `${API_URL}/users/me/avatar`,
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // DO NOT set 'Content-Type'. Axios handles it for FormData.
                }
            }
        );

        console.log('Upload Avatar Success Response:', response.data);

        // Some endpoints may return code 0 or 1000 as success
        const isSuccessCode = response.data.code === 1000 || response.data.code === 0;
        if (!isSuccessCode) {
            throw new Error(response.data.message || 'Failed to upload avatar');
        }

        const newImgUrl = response.data.data.imgUrl;

        // Update cached user immediately for UI freshness
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser && storedUser !== 'undefined') {
                const parsed = JSON.parse(storedUser);
                const updated = { ...parsed, imgUrl: newImgUrl };
                localStorage.setItem('user', JSON.stringify(updated));
            }
        } catch (e) {
            console.warn('Failed to update cached user after avatar upload:', e);
        }

        return newImgUrl;
    } catch (error: unknown) {
        console.error('Upload Avatar API Error Details:', {
            error,
            response: axios.isAxiosError(error) ? error.response : undefined,
            message: error instanceof Error ? error.message : 'Unknown error',
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
        });

        if (axios.isAxiosError(error) && error.response) {
            const responseData = error.response.data;
            console.error('Upload Avatar API Response:', {
                status: error.response.status,
                data: responseData,
                headers: error.response.headers,
                config: error.response.config
            });

            if (responseData && (responseData.message || responseData.error)) {
                const serverMsg = responseData.message || responseData.error;
                throw new Error(typeof serverMsg === 'string' ? serverMsg : 'Upload failed with server validation error');
            }

            // Handle specific errors for upload avatar
            switch (error.response.status) {
                case 400:
                    throw new Error('Invalid file format or size');
                case 401:
                    throw new Error('Unauthorized access to upload avatar');
                case 404:
                    throw new Error('Upload endpoint not found');
                case 413:
                    throw new Error('File size too large');
                case 415:
                    throw new Error('Unsupported file type');
                case 429:
                    throw new Error('Too many requests. Please try again later');
                case 500:
                    throw new Error('Server error. Please try again later');
                default:
                    throw new Error(`Failed to upload avatar (${error.response.status}): ${responseData?.message || 'Unknown error'}`);
            }
        }

        if (error instanceof Error) {
            throw error;
        }

        throw new Error('Network error. Please check your connection and try again');
    }
};


export const googleLoginApi = async (code: string): Promise<AuthResponse> => {

    try {
        console.log('Google Login API: Sending request without auth header', { hasCode: !!code });

        const response = await publicAxios.post<LoginApiResponse>(`/auth/outbound/authentication?code=${code}`);

        // Check if response has the expected structure
        if (response.data.code !== 1000 && response.data.code !== 0) {
            throw new Error(response.data.message || 'Google authentication failed');
        }

        const { token, roles } = response.data.data;

        if (!token) {
            throw new Error('Authentication failed - no token received');
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
            email: decodedToken.email || '',
            imgUrl: decodedToken.imgUrl || decodedToken.avatar || '',
            dob: decodedToken.dob ? new Date(decodedToken.dob) : new Date(),
            role: mapRolesToUserRole(roles),
            tokenBalance: decodedToken.tokenBalance || 0,
        };

        return { user, token };

    } catch (error: unknown) {
        console.error('Google Login API Error Details:', {
            error,
            response: axios.isAxiosError(error) ? error.response : undefined,
            message: error instanceof Error ? error.message : 'Unknown error',
            hasCode: !!code
        });

        if (axios.isAxiosError(error) && error.response) {
            const responseData = error.response.data;
            console.error('Google Login API: Backend error response', {
                status: error.response.status,
                data: responseData
            });

            if (responseData && responseData.message) {
                throw new Error(responseData.message);
            }
            if (responseData && responseData.error) {
                throw new Error(responseData.error);
            }

            // Handle specific 401 error for Google login
            if (error.response.status === 401) {
                throw new Error('Google authentication failed. Please try again.');
            }
        }

        throw new Error('Google authentication failed');
    }

};

export const registerApi = async (email: string, password: string, firstName: string, lastName: string, dob: Date): Promise<AuthResponse> => {
    try {
        console.log('Registration API: Sending request without auth header');
        const response = await publicAxios.post<AuthResponse>('/users', { email, password, firstName, lastName, dob });
        console.log('Registration API: Success response', response.data);
        return response.data;
    } catch (error: unknown) {
        console.error('Registration API Error Details:', {
            error,
            response: axios.isAxiosError(error) ? error.response : undefined,
            message: error instanceof Error ? error.message : 'Unknown error'
        });

        if (axios.isAxiosError(error) && error.response) {
            const responseData = error.response.data;
            if (responseData && responseData.message) {
                throw new Error(responseData.message);
            }
            if (responseData && responseData.error) {
                throw new Error(responseData.error);
            }
        }

        throw new Error('Registration failed');
    }
};

export const forgotPasswordApi = async (email: string): Promise<AuthResponse> => {
    try {
        console.log('Forgot Password API: Attempting request to /auth/forgot-password with email:', email);

        const response = await publicAxios.post<AuthResponse>('/auth/forgot-password', { email }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });

        console.log('Forgot Password API: Success response', response.data);
        return response.data;
    } catch (error: unknown) {
        console.error('Forgot Password API Error Details:', {
            error,
            response: axios.isAxiosError(error) ? error.response : undefined,
            message: error instanceof Error ? error.message : 'Unknown error',
            email,
            url: '/auth/forgot-password'
        });

        if (axios.isAxiosError(error) && error.response) {
            const responseData = error.response.data;
            console.error('Forgot Password API: Server response details', {
                status: error.response.status,
                statusText: error.response.statusText,
                data: responseData,
                headers: error.response.headers
            });

            // Handle specific 401 error for forgot password
            if (error.response.status === 401) {
                if (responseData && responseData.message) {
                    throw new Error(`Server error: ${responseData.message}`);
                }
                throw new Error('Unauthorized access to forgot password endpoint. Please contact support if this issue persists.');
            }

            if (responseData && responseData.message) {
                throw new Error(responseData.message);
            }
            if (responseData && responseData.error) {
                throw new Error(responseData.error);
            }

            // Handle other specific status codes
            switch (error.response.status) {
                case 404:
                    throw new Error('Forgot password endpoint not found. Please contact support.');
                case 429:
                    throw new Error('Too many requests. Please wait a moment and try again.');
                case 500:
                    throw new Error('Server error. Please try again later.');
                default:
                    throw new Error(`Request failed (${error.response.status}): ${error.response.statusText}`);
            }
        }

        if (error instanceof Error) {
            throw error;
        }

        throw new Error('Network error. Please check your connection and try again.');
    }
};

export const changePasswordApi = async (changePassword: ChangePasswordRequest): Promise<AuthResponse> => {
    try {
        const response = await publicAxios.post<AuthResponse>('/auth/change-password', changePassword);
        return response.data;
    } catch (error: unknown) {
        console.error('Change Password API Error Details:', {
            error,
            response: axios.isAxiosError(error) ? error.response : undefined,
            message: error instanceof Error ? error.message : 'Unknown error'
        });

        if (axios.isAxiosError(error) && error.response) {
            const responseData = error.response.data;
            if (responseData && responseData.message) {
                throw new Error(responseData.message);
            }
            if (responseData && responseData.error) {
                throw new Error(responseData.error);
            }
        }

        throw new Error('Password reset failed');
    }
};

export const verifyEmailApi = async (email: string, token: string): Promise<AuthResponse> => {
    try {
        console.log('VerifyEmail API: Sending request without auth header', { email, hasToken: !!token });
        const response = await publicAxios.post<AuthResponse>('auth/verify-email', { email, token });
        console.log('VerifyEmail API: Success response', response.data);
        return response.data;
    } catch (error: unknown) {
        console.error('Verify Email API Error Details:', {
            error,
            response: axios.isAxiosError(error) ? error.response : undefined,
            message: error instanceof Error ? error.message : 'Unknown error',
            email,
            hasToken: !!token
        });

        if (axios.isAxiosError(error) && error.response) {
            const responseData = error.response.data;
            console.error('VerifyEmail API: Backend error response', {
                status: error.response.status,
                data: responseData
            });

            if (responseData && responseData.message) {
                throw new Error(responseData.message);
            }
            if (responseData && responseData.error) {
                throw new Error(responseData.error);
            }

            // Handle specific 401 error for verify email
            if (error.response.status === 401) {
                throw new Error('Invalid or expired verification token. Please try registering again.');
            }
        }

        throw new Error('Email verification failed');
    }
};

export const verifyOtpApi = async (email: string, otp: string, newPassword: string): Promise<AuthResponse> => {
    try {
        const response = await publicAxios.post<AuthResponse>('/auth/verify-otp', { email, otp, newPassword });
        return response.data;
    } catch (error: unknown) {
        console.error('Verify OTP API Error Details:', {
            error,
            response: axios.isAxiosError(error) ? error.response : undefined,
            message: error instanceof Error ? error.message : 'Unknown error'
        });

        if (axios.isAxiosError(error) && error.response) {
            const responseData = error.response.data;
            if (responseData && responseData.message) {
                throw new Error(responseData.message);
            }
            if (responseData && responseData.error) {
                throw new Error(responseData.error);
            }
        }

        throw new Error('OTP verification failed');
    }
};

export const refreshTokenApi = async (token: string): Promise<AuthResponse> => {
    try {
        const response = await axiosInstance.post<AuthResponse>('auth/refresh-token', { token });
        return response.data;
    } catch (error: unknown) {
        console.error('Refresh Token API Error Details:', {
            error,
            response: axios.isAxiosError(error) ? error.response : undefined,
            message: error instanceof Error ? error.message : 'Unknown error'
        });

        if (axios.isAxiosError(error) && error.response) {
            const responseData = error.response.data;
            if (responseData && responseData.message) {
                throw new Error(responseData.message);
            }
            if (responseData && responseData.error) {
                throw new Error(responseData.error);
            }
        }

        throw new Error('Token refresh failed');
    }
};

/**
 * Lấy thông tin profile của user hiện tại từ API /users/me
 * @returns AuthResponse containing the user's profile information
 */
export const getCurrentUserApi = async (): Promise<AuthResponse> => {
    try {

        const response = await axiosInstance.get('/users/me');

        // Check if response has the expected structure
        if (response.data.code !== 1000) {
            throw new Error(response.data.message || 'Failed to fetch user profile');
        }

        const userData = response.data.data;

        if (!userData) {
            throw new Error('Invalid user data received from API');
        }

        // Map API response to User object
        const user: User = {
            id: parseInt(userData.id) || 0,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            imgUrl: userData.imgUrl || '',
            dob: userData.dob ? new Date(userData.dob) : new Date(),
            role: mapRolesToUserRole(userData.roles || []),
            tokenBalance: userData.tokenBalance || 0,
        };

        return { user, token: '' }; // Token is already available from login
    } catch (error: unknown) {
        console.error('Get Current User API Error Details:', {
            error,
            response: axios.isAxiosError(error) ? error.response : undefined,
            message: error instanceof Error ? error.message : 'Unknown error'
        });

        if (axios.isAxiosError(error) && error.response) {
            const responseData = error.response.data;
            console.error('Get Current User API: Backend error response', {
                status: error.response.status,
                data: responseData
            });

            if (responseData && responseData.message) {
                throw new Error(responseData.message);
            }
            if (responseData && responseData.error) {
                throw new Error(responseData.error);
            }

            // Handle specific errors for get current user
            switch (error.response.status) {
                case 401:
                    throw new Error('Unauthorized access to user profile');
                case 404:
                    throw new Error('User profile not found');
                case 429:
                    throw new Error('Too many requests. Please try again later');
                case 500:
                    throw new Error('Server error. Please try again later');
                default:
                    throw new Error(`Failed to fetch user profile (${error.response.status})`);
            }
        }

        if (error instanceof Error) {
            throw error;
        }

        throw new Error('Network error. Please check your connection and try again');
    }
};
