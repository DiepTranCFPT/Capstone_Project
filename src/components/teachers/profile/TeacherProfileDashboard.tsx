import React, { useState } from "react";
import { Card, Button, Spin, Badge, Modal } from "antd";
import { EditOutlined, LockOutlined, FileTextOutlined, UserAddOutlined } from "@ant-design/icons";
import { useAuth } from "~/hooks/useAuth";
import { getCurrentUserApi } from "~/services/authService";
import { toast } from "~/components/common/Toast";
import TeacherChangePasswordForm from "./TeacherChangePasswordForm";
import EditTeacherProfileForm from "./EditTeacherProfileForm";
import AvatarUpload from "~/components/students/profile/AvatarUpload";
import EditProfileForm from "~/components/students/profile/EditProfileForm";

const TeacherProfileDashboard: React.FC = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
  const [editTeacherProfileModalVisible, setEditTeacherProfileModalVisible] = useState(false);
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);

  const profile = user?.teacherProfile;

  // Function to refresh user data from API and update localStorage
  const refreshUser = async () => {
    try {
      const response = await getCurrentUserApi();
      if (response.user) {
        // Set lại toàn bộ user data thay vì cập nhật thuộc tính bên trong
        localStorage.setItem('user', JSON.stringify(response.user));

        toast.success('Thông tin đã được cập nhật!');
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
        <p className="mt-4 text-gray-600">Đang tải thông tin giáo viên...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">Không thể tải thông tin giáo viên. Vui lòng đăng nhập lại.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="p-6 max-w-7xl mx-auto grid gap-6">
        {/* Header với thông tin cơ bản */}
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
                  <Badge color="orange" text={user.role} />
                </div>
                <div className="flex gap-3">
                  <span className="text-gray-600">Ngày sinh:</span>
                  <span>🎂 {user.dob && user.dob ? new Date(user.dob).toLocaleDateString('vi-VN') : 'N/A'}</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-gray-600">Token:</span>
                  <span className="font-medium text-green-600">{user.tokenBalance}</span>
                </div>

                {profile && (
                  <>
                    <div className="flex gap-3">
                      <span className="text-gray-600">Rating:</span>
                      <Badge count={`${profile.rating}/5`} style={{ backgroundColor: '#52c41a' }} />
                    </div>
                    <div className="flex gap-3">
                      <span className="text-gray-600">Trạng thái xác thực:</span>
                      <Badge color={profile.isVerified ? 'green' : 'orange'} text={profile.isVerified ? 'Đã xác thực' : 'Chờ xác thực'} />
                    </div>
                  </>
                )}

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

        {profile ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Thông tin chuyên môn */}
            <Card title={
              <div className="flex items-center gap-2">
                <EditOutlined className="text-blue-500" />
                Thông tin chuyên môn
              </div>
            } className="shadow-sm">
              <div className="space-y-4">
                <div>
                  <div className="font-medium text-sm text-gray-700 mb-2">Lĩnh vực chuyên môn</div>
                  <p className="text-sm">{profile?.specialization || 'Chưa cập nhật'}</p>
                </div>

                <div className="border-t pt-4">
                  <div className="font-medium text-sm text-gray-700 mb-2">Trình độ học vấn</div>
                  <div className="space-y-1">
                    <div className="text-sm">🎓 {profile?.qualification || 'Chưa cập nhật'}</div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="font-medium text-sm text-gray-700 mb-2">Kinh nghiệm</div>
                  <p className="text-sm">{profile?.experience || 'Chưa cập nhật'}</p>
                </div>

                {profile?.certificateUrls && profile.certificateUrls.length > 0 && (
                  <div className="border-t pt-4">
                    <div className="font-medium text-sm text-gray-700 mb-2">Chứng chỉ</div>
                    <div className="space-y-1">
                      {profile.certificateUrls.map((url, index) => (
                        <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block text-sm">
                          Chứng chỉ {index + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Edit button for Teacher Info */}
                <div className="pt-4 border-t border-gray-200">
                  <Button
                    type="default"
                    icon={<EditOutlined />}
                    onClick={() => setEditTeacherProfileModalVisible(true)}
                    size="small"
                  >
                    Chỉnh sửa thông tin chuyên môn
                  </Button>
                </div>
              </div>
            </Card>

            {/* Giới thiệu */}
            <Card title={
              <div className="flex items-center gap-2">
                <FileTextOutlined className="text-green-500" />
                Giới thiệu về tôi
              </div>
            } className="shadow-sm">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 leading-relaxed">{profile?.biography || 'Chưa cập nhật'}</p>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div className="flex justify-center">
            <Button
              type="primary"
              size="large"
              icon={<UserAddOutlined />}
              onClick={() => setEditTeacherProfileModalVisible(true)}
            >
              Tạo hồ sơ giáo viên
            </Button>
          </div>
        )}

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
              {profile ? <EditOutlined className="text-blue-500" /> : <UserAddOutlined className="text-green-500" />}
              {profile ? 'Chỉnh sửa thông tin giáo viên' : 'Tạo hồ sơ giáo viên'}
            </div>
          }
          open={editTeacherProfileModalVisible}
          onCancel={() => setEditTeacherProfileModalVisible(false)}
          footer={null}
          width={700}
          destroyOnClose
        >
          <EditTeacherProfileForm
            currentUser={user}
            mode={profile ? 'update' : 'create'}
            onSuccess={async () => {
              setEditTeacherProfileModalVisible(false);
              await refreshUser();
            }}
            onCancel={() => setEditTeacherProfileModalVisible(false)}
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
          <TeacherChangePasswordForm
            onSuccess={() => {
              setChangePasswordModalVisible(false);
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

export default TeacherProfileDashboard;
