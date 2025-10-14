import axios from 'axios';
import { refreshTokenApi } from '../services/authService';

const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
    // eslint-disable-next-line no-console
    console.warn('[Axios] VITE_API_URL is not defined. Requests will fail. Set it in your .env');
}

// Main axios instance with authentication interceptor
const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
    timeout: 30000,
});

// Public axios instance without authentication (for public endpoints)
export const publicAxios = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
    timeout: 30000,
});

// Request queue for failed requests during token refresh
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: string) => void;
    reject: (reason?: Error) => void;
}> = [];

// Process the request queue after token refresh
const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token || undefined);
        }
    });

    failedQueue = [];
};

// Add request interceptor to automatically add token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptor to handle token expiration and refresh
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Check if error is due to token expiration (401) and not already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                    }
                    return axiosInstance(originalRequest);
                }).catch(err => {
                    throw err;
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Attempt to refresh token
                const refreshToken = localStorage.getItem('token');
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                // Call refresh token API using the service function
                const response = await refreshTokenApi(refreshToken);

                // The refreshTokenApi already handles success code checking and returns AuthResponse
                const { token: newToken, user } = response;

                // Update stored token and user data
                localStorage.setItem('token', newToken);
                
                console.log(user)

                // Update authorization header for original request
                originalRequest.headers.Authorization = `Bearer ${newToken}`;

                // Process queued requests with new token
                processQueue(null, newToken);

                // Retry original request
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                // Refresh failed, process queue with error
                const error = refreshError instanceof Error ? refreshError : new Error('Token refresh failed');
                processQueue(error, null);

                // Clear stored auth data
                localStorage.removeItem('token');

                // Log the refresh failure but don't redirect immediately
                console.error('Token refresh failed:', refreshError);
                console.log('Authentication failed - user needs to login again');

                // Don't redirect immediately, let the application handle the error
                // This prevents losing debug information and allows proper error handling
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // For other errors, log detailed error information and reject
        console.error('API Error Details:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message,
            fullError: error
        });
        return Promise.reject(error);
    }
);

export default axiosInstance;
