import React, { useState } from "react";
import { Card, Button, Spin, Badge, Modal } from "antd";
import { EditOutlined, LockOutlined } from "@ant-design/icons";
import { useAuth } from "~/hooks/useAuth";
import { getCurrentUserApi } from "~/services/authService";
import { toast } from "~/components/common/Toast";
import AvatarUpload from "~/components/students/profile/AvatarUpload";
import EditProfileForm from "~/components/students/profile/EditProfileForm";
import ChangePasswordForm from "~/components/students/profile/ChangePasswordForm";
import EditParentProfileForm from "./EditParentProfileForm";

const ParentProfileDashboard: React.FC = () => {
    const { user, loading: authLoading, logout } = useAuth();
    const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
    const [editParentProfileModalVisible, setEditParentProfileModalVisible] = useState(false);
    const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);

    // Function to refresh user data from API and update localStorage
    const refreshUser = async () => {
        try {
            const response = await getCurrentUserApi();
            if (response.user) {
                // Set lại toàn bộ user data thay vì cập nhật thuộc tính bên trong
                localStorage.setItem('user', JSON.stringify(response.user));

                toast.success('Thông tin đã được cập nhật!');
                // Force re-render by reloading page
                window.location.reload();
            }
        } catch (error) {
            console.error('Error refreshing user data:', error);
            toast.error('Không thể cập nhật thông tin. Vui lòng thử lại.');
        }
    };

    // Function to handle logout after password change
    const handleLogout = () => {
        logout();
        toast.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
        window.location.href = '/auth';
    };

    if (authLoading) {
        return (
            <div className="p-6 text-center">
                <Spin size="large" />
                <p className="mt-4 text-gray-600">Đang tải thông tin cá nhân...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-600">Không thể tải thông tin cá nhân. Vui lòng đăng nhập lại.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="p-6 max-w-6xl mx-auto grid gap-6">
                {/* Header đơn giản */}
                <Card className="mb-6 shadow-sm">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <AvatarUpload />
                        <div className="flex flex-col gap-6">
                            <Card title="Thông tin cá nhân" className="shadow-sm">
                                <div className="space-y-3">
                                    <div className="flex gap-3">
                                        <span className="text-gray-600">Họ tên:</span>
                                        <span className="font-medium">{user.firstName} {user.lastName}</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <span className="text-gray-600">Email:</span>
                                        <span className="font-medium">{user.email}</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <span className="text-gray-600">Vai trò:</span>
                                        <Badge color="blue" text={user.role} />
                                    </div>
                                    <div className="flex gap-3">
                                        <span className="text-gray-600">Ngày sinh:</span>
                                        <span>🎂 {user.dob ? new Date(user.dob).toLocaleDateString() : 'N/A'}</span>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="pt-4 border-t border-gray-200">
                                        <div className="flex gap-2 flex-wrap">
                                            <Button
                                                type="primary"
                                                icon={<EditOutlined />}
                                                onClick={() => setEditProfileModalVisible(true)}
                                                size="small"
                                            >
                                                Chỉnh sửa thông tin
                                            </Button>
                                            <Button
                                                icon={<LockOutlined />}
                                                onClick={() => setChangePasswordModalVisible(true)}
                                                size="small"
                                                danger
                                            >
                                                Đổi mật khẩu
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card title="Thông tin phụ huynh" className="shadow-sm">
                                <div className="space-y-3">
                                    <div className="flex gap-3">
                                        <span className="text-gray-600">Nghề nghiệp:</span>
                                        <span className="font-medium">{user.parentProfile?.occupation || "Chưa cập nhật"}</span>
                                    </div>

                                    {/* Edit button */}
                                    <div className="pt-4 border-t border-gray-200">
                                        <div className="flex gap-2 flex-wrap">
                                            <Button
                                                type="default"
                                                icon={<EditOutlined />}
                                                onClick={() => setEditParentProfileModalVisible(true)}
                                                size="small"
                                            >
                                                Chỉnh sửa thông tin phụ huynh
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </Card>

                {/* Modals */}
                <Modal
                    title={
                        <div className="flex items-center gap-2">
                            <EditOutlined className="text-blue-500" />
                            Chỉnh sửa thông tin cá nhân
                        </div>
                    }
                    open={editProfileModalVisible}
                    onCancel={() => setEditProfileModalVisible(false)}
                    footer={null}
                    width={600}
                    destroyOnClose
                >
                    <EditProfileForm
                        onSuccess={async () => {
                            setEditProfileModalVisible(false);
                            await refreshUser();
                        }}
                        onCancel={() => setEditProfileModalVisible(false)}
                    />
                </Modal>

                <Modal
                    title={
                        <div className="flex items-center gap-2">
                            <LockOutlined className="text-orange-500" />
                            Đổi mật khẩu
                        </div>
                    }
                    open={changePasswordModalVisible}
                    onCancel={() => setChangePasswordModalVisible(false)}
                    footer={null}
                    width={500}
                    destroyOnClose
                >
                    <ChangePasswordForm
                        onSuccess={() => {
                            setChangePasswordModalVisible(false);
                            // Close modal first, then logout after a short delay
                            setTimeout(() => {
                                handleLogout();
                            }, 100);
                        }}
                    />
                </Modal>

                <Modal
                    title={
                        <div className="flex items-center gap-2">
                            <EditOutlined className="text-blue-500" />
                            Chỉnh sửa thông tin phụ huynh
                        </div>
                    }
                    open={editParentProfileModalVisible}
                    onCancel={() => setEditParentProfileModalVisible(false)}
                    footer={null}
                    width={600}
                    destroyOnClose
                >
                    <EditParentProfileForm
                        onSuccess={async () => {
                            setEditParentProfileModalVisible(false);
                            await refreshUser();
                        }}
                        onCancel={() => setEditParentProfileModalVisible(false)}
                    />
                </Modal>
            </div>
        </div>
    );
};

export default ParentProfileDashboard;
