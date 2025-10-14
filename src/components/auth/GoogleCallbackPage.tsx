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

        console.log('GoogleCallbackPage: Processing Google OAuth callback', {
            hasCode: !!code,
            hasError: !!error,
            processing: processingRef.current
        });

        if (error) {
            console.error("Google OAuth error:", error);
            navigate('/auth?error=google_auth_failed');
            return;
        }

        if (code && !processingRef.current) {
            processingRef.current = true;

            const sendCodeToBackend = async (authorizationCode: string) => {
                try {
                    console.log('GoogleCallbackPage: Sending code to backend', { hasCode: !!authorizationCode });

                    // Sử dụng googleLoginApi từ authService (đã được fix để dùng publicAxios)
                    const response = await googleLoginApi(authorizationCode);

                    if (response && response.token) {
                        console.log("Google login successful, received token");

                        // Sử dụng handleAuthResponse từ AuthContext để cập nhật state
                        handleAuthResponse(response);

                        // Đăng nhập thành công, điều hướng đến trang chính
                        navigate('/');
                    } else {
                        throw new Error("Không nhận được token từ backend.");
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
            <p className="mt-4 text-xl font-semibold text-gray-700">Đang xử lý đăng nhập Google...</p>
            <p className="mt-2 text-sm text-gray-500 text-center max-w-md">
                Vui lòng đợi trong khi chúng tôi xác thực thông tin đăng nhập của bạn.
            </p>
        </div>
    );
};

export default GoogleCallbackPage;
