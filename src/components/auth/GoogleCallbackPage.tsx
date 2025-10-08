// src/pages/auth/GoogleCallbackPage.tsx
import { Spin } from 'antd';
import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from '~/configs/axios'; // Import instance axios đã cấu hình của bạn
import { useAuth } from '~/hooks/useAuth'; // Import useAuth hook

const GoogleCallbackPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { handleAuthResponse } = useAuth(); // Giả sử bạn có hàm này trong context để xử lý token và user data

    useEffect(() => {
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
            console.error("Lỗi xác thực Google:", error);
            // Điều hướng về trang đăng nhập và có thể hiển thị lỗi
            navigate('/auth?error=google_auth_failed');
            return;
        }

        if (code) {
            // Gửi code này đến backend của bạn
            const sendCodeToBackend = async (authorizationCode: string) => {
                try {
                    // Gọi đến endpoint mà bạn cung cấp trong hình
                    // Endpoint yêu cầu `code` là một query parameter
                    const response = await axios.post(`/auth/outbound/authentication?code=${authorizationCode}`);

                    // API của bạn trả về { code, message, data: { token, authenticated, roles } }
                    const { data } = response.data;

                    if (data && data.token) {
                        // Cập nhật trạng thái đăng nhập trong AuthContext
                        // Bạn cần một hàm trong AuthProvider để xử lý việc này
                        // Ví dụ: handleAuthResponse(data)                      
                        // Hàm này sẽ set user, token, và lưu vào localStorage
                        handleAuthResponse(data);
                        console.log("Đăng nhập thành công, nhận được token:", data.token);

                        // Giả lập user object từ token nếu backend không trả về
                        const userPayload = { user: data.user, token: data.token };

                        // Dùng hàm từ AuthContext để cập nhật state
                        handleAuthResponse(userPayload);


                        // Đăng nhập thành công, điều hướng đến trang chính
                        navigate('/');
                    } else {
                        throw new Error("Không nhận được token từ backend.");
                    }

                } catch (err) {
                    console.error("Lỗi khi gửi code đến backend:", err);
                    navigate('/auth?error=backend_token_exchange_failed');
                }
            };

            sendCodeToBackend(code);
        } else {
            // Không có code, có thể là truy cập trực tiếp
            navigate('/auth');
        }

        // Thêm các dependency cần thiết để tránh warning
    }, [searchParams, navigate, handleAuthResponse]);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-white">
            <Spin size="large" />
            <p className="mt-4 text-2xl font-bold text-black text-shadow">Đang xử lý đăng nhập...</p>

        </div>
    );
};

export default GoogleCallbackPage;