import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
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
    // timeout: 30000,
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

// Add response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Check if error is due to token expiration (401)
        if (error.response?.status === 401) {
            // Clear stored auth data
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Log the authentication failure
            console.error('Authentication failed - token expired or invalid');

            // Redirect to login page
            // window.location.href = '/auth';

            // Return a rejected promise to prevent further processing
            return Promise.reject(error);
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
