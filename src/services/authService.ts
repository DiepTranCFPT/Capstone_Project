
import type { AuthResponse } from "~/types/auth";
import users from "~/data/user"; // Import the mock user data

export const loginApi = async (email: string, password: string): Promise<AuthResponse> => {
    console.log('Call login API with: ', { email, password });
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const foundUser = users.find(user => user.email === email && user.password === password);

            if (foundUser) {
                // Simulate a successful login
                resolve({
                    user: {
                        id: foundUser.id,
                        name: foundUser.name,
                        email: foundUser.email,
                        avatar: foundUser.avatar,
                        role: foundUser.role as AuthResponse['user']['role'],
                        tokenBalance: foundUser.tokenBalance
                    },
                    token: 'fake-jwt-token', // In a real app, this would be a generated JWT
                });
            } else {
                // Simulate a failed login
                reject(new Error('Invalid email or password'));
            }
        }, 1000);
    });
};

export const registerApi = async (name: string, email: string, password: string): Promise<AuthResponse> => {
    console.log('Call register API with: ', { name, email, password });
    return new Promise((resolve) => {
        setTimeout(() => {
            // In a real application, you would save the new user to a database.
            // For this mock, we'll just simulate a successful registration
            // and return a generic student user.
            const newUser = {
                id: users.length + 1, // Simple ID generation
                name,
                email,
                password, // In a real app, password would be hashed
                avatar: 'https://i.pravatar.cc/150?img=new',
                role: 'student' as const, // Default role for new registrations
                tokenBalance: 50,
            };
            users.push(newUser); // Add new user to mock data

            resolve({
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    avatar: newUser.avatar,
                    role: newUser.role,
                    tokenBalance: newUser.tokenBalance
                },
                token: 'fake-jwt-token-register',
            });
        }, 1000);
    });
};

export const forgotPasswordApi = async (email: string): Promise<{ message: string }> => {
    console.log('Call forgot password API with: ', { email });
    return new Promise((resolve) => { // Added _ to indicate unused parameter
        setTimeout(() => {
            resolve({ message: 'Password reset link sent to your email' });
        }, 1000);
    });
};

export const resetPasswordApi = async (token: string, password: string): Promise<{ message: string }> => {
    console.log('Call reset password API with: ', { token, password });
    return new Promise((resolve) => { // Added _ to indicate unused parameter
        setTimeout(() => {
            resolve({ message: 'Password has been reset successfully' });
        }, 1000);
    });
};
