import React, { useState } from "react";
import { Card, Progress, Table, Tag, Button, Spin, Badge, Modal } from "antd";
import type { ColumnsType } from "antd/es/table";
import { mockProfile } from "~/data/profileData";
import type { Subject, TestResult, UserProfile } from "~/types/profile";
import { EditOutlined, LockOutlined } from "@ant-design/icons";
import EditProfileForm from "./EditProfileForm";
import AvatarUpload from "./AvatarUpload";
import ChangePasswordForm from "./ChangePasswordForm";
import { useAuth } from "~/hooks/useAuth";
import { getCurrentUserApi } from "~/services/authService";
import { toast } from "~/components/common/Toast";

const ProfileDashboard: React.FC = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);

  // Use mock data for subjects and test results since they're not in the auth user object
  const profile: UserProfile = mockProfile;

  const columns: ColumnsType<TestResult> = [
    { title: "Môn học", dataIndex: "subject", key: "subject" },
    { title: "Điểm số", dataIndex: "score", key: "score" },
    { title: "Ngày thi", dataIndex: "date", key: "date" },
  ];

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
                  <span>🎂 {user.dob ? new Date(user.dob).toLocaleDateString('vi-VN') : 'N/A'}</span>
                </div>

                <div className="flex gap-3">
                  <span className="text-gray-600">Token:</span>
                  <span className="font-medium text-green-600">{user.tokenBalance}</span>
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
          </div>
        </Card>

        {/* Nội dung chính */}

        <div className="">
          {/* Tiến độ học tập */}
          <div className="lg:col-span-3">
            <Card title="Tiến độ học tập" className="shadow-sm">
              <div className="space-y-4">
                {profile.subjects.map((subject: Subject) => (
                  <div key={subject.name} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{subject.name}</span>
                      <span className="text-blue-600 font-medium">{subject.progress}%</span>
                    </div>
                    <Progress percent={subject.progress} size="small" />
                    <div className="flex gap-2 mt-2">
                      <Tag color="green">✓ {subject.strength}</Tag>
                      <Tag color="orange">⚠ {subject.weakness}</Tag>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Kết quả luyện thi */}
          <div className="lg:col-span-3 mt-6">
            <Card title="Kết quả luyện thi" className="shadow-sm">
              <Table
                dataSource={profile.testResults}
                columns={columns}
                rowKey={(record) => record.subject + record.date}
                pagination={false}
                size="small"
              />
            </Card>
          </div>
        </div>
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
      </div>
    </div>
  );
};

export default ProfileDashboard;
