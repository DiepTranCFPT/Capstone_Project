import React, { useState } from "react";
import { Card, Button, Spin, Badge, Modal } from "antd";
import { EditOutlined, LockOutlined } from "@ant-design/icons";
import EditProfileForm from "./EditProfileForm";
import EditStudentProfileForm from "./EditStudentProfileForm";
import AvatarUpload from "./AvatarUpload";
import ChangePasswordForm from "./ChangePasswordForm";
import { useAuth } from "~/hooks/useAuth";
import { getCurrentUserApi } from "~/services/authService";
import { toast } from "~/components/common/Toast";
import { useStudentConnection } from "~/hooks/useStudentConnection";
import { useWalletBalance } from "~/hooks/useWalletBalance";

const ProfileDashboard: React.FC = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
  const [editStudentProfileModalVisible, setEditStudentProfileModalVisible] = useState(false);
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [connectionCodeModalVisible, setConnectionCodeModalVisible] = useState(false);
  const { connectionCode, loading: connectionLoading, fetchConnectionCode } = useStudentConnection();
  const { balance: tokenBalance, loading: balanceLoading } = useWalletBalance();

  // Function to refresh user data from API and update localStorage
  const refreshUser = async () => {
    try {
      const response = await getCurrentUserApi();
      if (response.user) {
        // Set lại toàn bộ user data thay vì cập nhật thuộc tính bên trong
        localStorage.setItem('user', JSON.stringify(response.user));

        toast.success('User data updated successfully!');
        // Force re-render by reloading page
        window.location.reload();
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      toast.error('Cannot update user data. Please try again.');
    }
  };

  // Function to handle logout after password change
  const handleLogout = () => {
    logout();
    toast.success('Password changed successfully! Please log in again.');
    window.location.href = '/auth';
  };

  if (authLoading) {
    return (
      <div className="p-6 text-center">
        <Spin size="large" />
        <p className="mt-4 text-gray-600">Loading user information...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">Failed to load user information. Please log in again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="md:p-6 max-w-6xl mx-auto grid gap-6">
        {/* Header đơn giản */}
        <Card className="mb-6 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AvatarUpload />
            <div className="flex flex-col gap-6">
              <Card title="Profile" className="shadow-sm">
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <span className="text-gray-600">Full name:</span>
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
                    <span className="text-gray-600">Birthday:</span>
                    <span>🎂 {user.dob ? new Date(user.dob).toLocaleDateString() : 'N/A'}</span>
                  </div>

                  <div className="flex gap-3">
                    <span className="text-gray-600">Balance:</span>
                    {balanceLoading ? (
                      <Spin size="small" />
                    ) : (
                        <span className="font-medium text-green-600">{tokenBalance?.toLocaleString('vi-VN') ?? user.tokenBalance.toLocaleString('vi-VN')} VNĐ</span>
                    )}
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
                        Edit
                      </Button>
                      <Button
                        icon={<LockOutlined />}
                        onClick={() => setChangePasswordModalVisible(true)}
                        size="small"
                        danger
                      >
                        Change password
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              <Card title="Student profile" className="shadow-sm">
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <span className="text-gray-600">School name:</span>
                    <span className="font-medium">{user.studentProfile?.schoolName || ""}</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-gray-600">Parent phone:</span>
                    <span className="font-medium">{user.studentProfile?.parentPhone || ""}</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-gray-600">Emergency contact:</span>
                    <span className="font-medium">{user.studentProfile?.emergencyContact || ""}</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-gray-600">Goal:</span>
                    {user.studentProfile?.goal ? (
                      <span className="font-medium">{user.studentProfile?.goal}</span>
                    ) : (
                        <span className="text-gray-600 italic">What result do you want to achieve ?</span>
                    )}
                  </div>

                  {/* Edit button */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        type="default"
                        icon={<EditOutlined />}
                        onClick={() => setEditStudentProfileModalVisible(true)}
                        size="small"
                      >
                        Edit
                      </Button>
                      <Button
                        type="primary"
                        onClick={() => {
                          setConnectionCodeModalVisible(true);
                          fetchConnectionCode();
                        }}
                        size="small"
                      >
                        View connection code
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Card>

        {/* Nội dung chính */}

        
        {/* Modals */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <EditOutlined className="text-blue-500" />
              Edit Profile
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
              Edit Student Profile
            </div>
          }
          open={editStudentProfileModalVisible}
          onCancel={() => setEditStudentProfileModalVisible(false)}
          footer={null}
          width={600}
          destroyOnClose
        >
          <EditStudentProfileForm
            onSuccess={async () => {
              setEditStudentProfileModalVisible(false);
              await refreshUser();
            }}
            onCancel={() => setEditStudentProfileModalVisible(false)}
          />
        </Modal>

        <Modal
          title="Connection Code"
          open={connectionCodeModalVisible}
          onCancel={() => setConnectionCodeModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setConnectionCodeModalVisible(false)}>
              Close
            </Button>,
          ]}
          width={500}
        >
          {connectionLoading ? (
            <div className="text-center py-8">
              <Spin size="large" />
              <p className="mt-4 text-gray-600">Loading connection code...</p>
            </div>
          ) : connectionCode ? (
            <div className="text-center py-6">
              <div className="mb-4">
                <p className="text-gray-600 mb-2">Your connection code:</p>
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                  <span className="text-3xl font-bold text-blue-600">{connectionCode}</span>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Share this code with your parent to connect and monitor your progress.
              </p>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-red-600">Unable to retrieve connection code. Please try again.</p>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default ProfileDashboard;
