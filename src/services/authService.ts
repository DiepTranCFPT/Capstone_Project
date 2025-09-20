
import type { AuthResponse } from "~/types/auth";
// const API_BASE_URL = "https://api.example.com";

// Mock function to simulate API call
const mockApiCall = (data: unknown): Promise<AuthResponse> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                user: { id: 1, name: 'Jonh Doe', email: (data as { email: string }).email, avatar: 'https://i.pravatar.cc/150?img=1', role:'student' },
                token: 'fake-jwt-token',
            });
        }, 1000);
    });
};

// Mock function API call failure
// const mockFailedApiCall = (): Promise<any> => {
//     return new Promise((_, reject) => {
//         setTimeout(() => {
//             reject(new Error('Invalid credentials'));
//         });
//     });
// };

export const loginApi = async (email: string, password: string) => {
    console.log('Call login API with: ',{ email, password});
    return mockApiCall({ email });
};

export const registerApi = async (name: string,email: string, password: string) => {
    console.log('Call register API with: ', { name, email, password});
    return mockApiCall({ email });
};

export const forgotPasswordApi = async (email: string): Promise<{ message: string }> => {
    console.log('Call forgot password API with: ',{ email });
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ message: 'Password reset link sent to your email' });
        }, 1000);
    });
};

export const resetPasswordApi = async (token: string, password: string): Promise<{ message: string }> => {
    console.log('Call reset password API with: ',{ token, password });
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ message: 'Password has been reset successfully' });
        }, 1000);
    });
};
