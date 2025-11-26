import React, { useState } from "react";
import { Card, Progress, Table, Tag, Button, Spin, Badge, Modal } from "antd";
import type { ColumnsType } from "antd/es/table";
import { mockProfile } from "~/data/profileData";
import type { Subject, TestResult, UserProfile } from "~/types/profile";
import { EditOutlined, LockOutlined } from "@ant-design/icons";
import EditProfileForm from "./EditProfileForm";
import EditStudentProfileForm from "./EditStudentProfileForm";
import AvatarUpload from "./AvatarUpload";
import ChangePasswordForm from "./ChangePasswordForm";
import { useAuth } from "~/hooks/useAuth";
import { getCurrentUserApi } from "~/services/authService";
import { toast } from "~/components/common/Toast";
import { useStudentConnection } from "~/hooks/useStudentConnection";

const ProfileDashboard: React.FC = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
  const [editStudentProfileModalVisible, setEditStudentProfileModalVisible] = useState(false);
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [connectionCodeModalVisible, setConnectionCodeModalVisible] = useState(false);
  const { connectionCode, loading: connectionLoading, fetchConnectionCode } = useStudentConnection();

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

              <Card title="Thông tin học tập" className="shadow-sm">
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <span className="text-gray-600">Trường học:</span>
                    <span className="font-medium">{user.studentProfile?.schoolName || ""}</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-gray-600">Số điện thoại phụ huynh:</span>
                    <span className="font-medium">{user.studentProfile?.parentPhone || ""}</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-gray-600">Liên hệ khẩn cấp:</span>
                    <span className="font-medium">{user.studentProfile?.emergencyContact || ""}</span>
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
                        Chỉnh sửa thông tin học tập
                      </Button>
                      <Button
                        type="primary"
                        onClick={() => {
                          setConnectionCodeModalVisible(true);
                          fetchConnectionCode();
                        }}
                        size="small"
                      >
                        Xem mã kết nối
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
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

        <Modal
          title={
            <div className="flex items-center gap-2">
              <EditOutlined className="text-blue-500" />
              Chỉnh sửa thông tin học tập
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
          title="Mã kết nối học sinh"
          open={connectionCodeModalVisible}
          onCancel={() => setConnectionCodeModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setConnectionCodeModalVisible(false)}>
              Đóng
            </Button>,
          ]}
          width={500}
        >
          {connectionLoading ? (
            <div className="text-center py-8">
              <Spin size="large" />
              <p className="mt-4 text-gray-600">Đang tải mã kết nối...</p>
            </div>
          ) : connectionCode ? (
            <div className="text-center py-6">
              <div className="mb-4">
                <p className="text-gray-600 mb-2">Mã kết nối của bạn:</p>
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                  <span className="text-3xl font-bold text-blue-600">{connectionCode}</span>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Chia sẻ mã này với phụ huynh để họ có thể kết nối và theo dõi tiến độ học tập của bạn.
              </p>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-red-600">Không thể lấy mã kết nối. Vui lòng thử lại.</p>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default ProfileDashboard;
