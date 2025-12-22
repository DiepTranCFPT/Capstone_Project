// src/pages/auth/GoogleCallbackPage.tsx
import { Spin } from 'antd';
import React, { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { googleLoginApi } from '~/services/authService'; // Import googleLoginApi đã được fix
import { useAuth } from '~/hooks/useAuth'; // Import useAuth hook

const GoogleCallbackPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { handleAuthResponse } = useAuth(); // Hàm xử lý authentication response
    const processingRef = useRef(false); // Prevent multiple processing

    useEffect(() => {
        const code = searchParams.get('code');
        const error = searchParams.get('error');
      
        if (error) {
            console.error("Google OAuth error:", error);
            navigate('/auth?error=google_auth_failed');
            return;
        }

        if (code && !processingRef.current) {
            processingRef.current = true;

            const sendCodeToBackend = async (authorizationCode: string) => {
                try {

                    // Sử dụng googleLoginApi từ authService (đã được fix để dùng publicAxios)
                    const response = await googleLoginApi(authorizationCode);

                    if (response && response.token) {
                        console.log("Google login successful, received token");

                        // Sử dụng handleAuthResponse từ AuthContext để cập nhật state
                        handleAuthResponse(response);

                        // Đăng nhập thành công, điều hướng đến trang chính
                        navigate('/');
                    } else {
                        throw new Error("Not received token from backend.");
                    }

                } catch (err) {
                    console.error("Google login failed:", err);

                    // Điều hướng về trang đăng nhập với lỗi cụ thể
                    if (err instanceof Error) {
                        navigate(`/auth?error=google_auth_failed&message=${encodeURIComponent(err.message)}`);
                    } else {
                        navigate('/auth?error=google_auth_failed');
                    }
                }
            };

            sendCodeToBackend(code);
        } else if (!code) {
            console.log('GoogleCallbackPage: No authorization code found');
            navigate('/auth');
        }

    }, [searchParams, navigate, handleAuthResponse]);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-white">
            <Spin size="large" />
            <p className="mt-4 text-xl font-semibold text-gray-700">Processing Google login...</p>
            <p className="mt-2 text-sm text-gray-500 text-center max-w-md">
                Please wait while we verify your login information.
            </p>
        </div>
    );
};

export default GoogleCallbackPage;
