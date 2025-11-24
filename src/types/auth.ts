import type { TeacherProfileData } from "./teacherProfile";

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    imgUrl: string;
    dob: Date;
    role: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'ACADEMIC_ADVISOR' | 'PARENT';
    tokenBalance: number;
    teacherProfile?: TeacherProfileData;
};

export interface LoginApiResponse {
    code: number;
    message: string;
    data: {
        token: string;
        authenticated: boolean;
        roles: string[];
    };
};

export interface JwtPayload {
    userId?: number;
    id?: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    imgUrl?: string;
    avatar?: string;
    dob?: string;
    tokenBalance?: number;
    exp?: number;
    iat?: number;
    [key: string]: unknown;
}

export interface AuthResponse {
    user: User;
    token: string;
};

export interface AuthContextType {
    handleAuthResponse: (response: { user: User, token: string }) => void;
    updateAuthFromStorage: () => void;
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    initialLoading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<string | null>;
    register: (email: string, password: string, firstName: string, lastName: string, dob: Date) => Promise<void>;
    loginWithGoogle: (code: string) => Promise<void>;
    verifyEmail: (email: string, token: string) => Promise<void>;
    verifyOtp: (email: string, otp: string, newPassword: string) => Promise<void>;
    logout: () => void;
    forceLogout: () => void;
    forgotPassword: (email: string) => Promise<void>;
    changePassword: (changePassword: ChangePasswordRequest) => Promise<void>;
    refreshToken: (token: string) => Promise<void>;
    spendTokens: (amount: number) => void;
};

export interface EditProfileRequest {
    firstName: string;
    lastName: string;
    dob: string; // ISO date string
}

export interface EditProfileResponse {
    code: number;
    message: string;
    data: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        imgUrl: string;
        dob: string;
        roles: string[];
        tokenBalance: number;
    };
}

export interface UploadAvatarResponse {
    code: number;
    message: string;
    data: {
        imgUrl: string;
    };
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    token: string;
}