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

                toast.success('Profile information updated successfully!');
                // Force re-render by reloading page
                window.location.reload();
            }
        } catch (error) {
            console.error('Error refreshing user data:', error);
            toast.error('Failed to update profile information. Please try again.');
        }
    };

    // Function to handle logout after password change
    const handleLogout = () => {
        logout();
        toast.success('Password changed successfully! Please login again.');
        window.location.href = '/auth';
    };

    if (authLoading) {
        return (
            <div className="p-6 text-center">
                <Spin size="large" />
                <p className="mt-4 text-gray-600">Loading profile information...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="p-6 text-center">
                <p className="text-red-600">Cannot load profile information. Please login again.</p>
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
                            <Card title="Profile Information" className="shadow-sm">
                                <div className="space-y-3">
                                    <div className="flex gap-3">
                                        <span className="text-gray-600">Full Name:</span>
                                        <span className="font-medium">{user.firstName} {user.lastName}</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <span className="text-gray-600">Email:</span>
                                        <span className="font-medium">{user.email}</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <span className="text-gray-600">Role:</span>
                                        <Badge color="blue" text={user.role} />
                                    </div>
                                    <div className="flex gap-3">
                                        <span className="text-gray-600">Date of Birth:</span>
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
                                                Edit Profile
                                            </Button>
                                            <Button
                                                icon={<LockOutlined />}
                                                onClick={() => setChangePasswordModalVisible(true)}
                                                size="small"
                                                danger
                                            >
                                                Change Password
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card title="Parent Information" className="shadow-sm">
                                <div className="space-y-3">
                                    <div className="flex gap-3">
                                        <span className="text-gray-600">Occupation:</span>
                                        <span className="font-medium">{user.parentProfile?.occupation || "Not updated"}</span>
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
                                                Edit Parent Information
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
                            Edit Profile Information
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
                            Change Password
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
                            Edit Parent Information
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
