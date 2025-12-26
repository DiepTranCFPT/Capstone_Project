import React, { useState } from "react";
import { Card, Button, Spin, Badge, Modal } from "antd";
import { EditOutlined, LockOutlined, FileTextOutlined, UserAddOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useAuth } from "~/hooks/useAuth";
import { getCurrentUserApi } from "~/services/authService";
import TeacherProfileService from "~/services/teacherProfileService";
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
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [checkRequestLoading, setCheckRequestLoading] = useState(false);

  const profile = user?.teacherProfile;

  // Function to refresh user data from API and update localStorage
  const refreshUser = async () => {
    try {
      const response = await getCurrentUserApi();
      if (response.user) {
        // Set lại toàn bộ user data thay vì cập nhật thuộc tính bên trong
        localStorage.setItem('user', JSON.stringify(response.user));

        toast.success('Information updated successfully!');
        window.location.reload();
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      toast.error('Failed to update information. Please try again.');
    }
  };

  // Function to handle logout after password change
  const handleLogout = () => {
    logout();
    toast.success('Password changed successfully! Please login again.');
    window.location.href = '/auth';
  };

  // Function to request verification
  const handleRequestVerification = async () => {
    try {
      setVerifyLoading(true);
      const response = await TeacherProfileService.requestVerification();
      if (response.data) {
        toast.success('Verification request submitted successfully! Please wait for admin approval.');
        
        // Call AI review after successful verification request
        if (user?.id) {
          try {
            await TeacherProfileService.getAiReview(user.id);
          } catch (aiError) {
            console.error('Error getting AI review:', aiError);
            // Don't show error to user as this is optional
          }
        }
      }
    } catch (error: unknown) {
      console.error('Error requesting verification:', error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to submit verification request. Please try again.');
    } finally {
      setVerifyLoading(false);
    }
  };

  // Function to check current verification request status
  const handleCheckCurrentRequest = async () => {
    try {
      setCheckRequestLoading(true);
      const response = await TeacherProfileService.getCurrentVerificationRequest();
      if (response.data?.data) {
        const data = response.data.data;
        // Handle both array and object response
        const requestData = Array.isArray(data) ? data[0] : data;
        if (requestData) {
          toast.success(`Request Status: ${requestData.status || 'Pending'}. Created at: ${requestData.createdAt ? new Date(requestData.createdAt).toLocaleString('vi-VN') : 'N/A'}`);
        } else {
          toast.info('No verification request found.');
        }
      } else {
        toast.info('No verification request found.');
      }
    } catch (error: unknown) {
      console.error('Error checking verification request:', error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to check verification request.');
    } finally {
      setCheckRequestLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="p-6 text-center">
        <Spin size="large" />
        <p className="mt-4 text-gray-600">Loading teacher information...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">Failed to load teacher information. Please login again.</p>
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
            <Card title="Personal Information" className="shadow-sm">
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
                  <Badge color="orange" text={user.role} />
                </div>
                <div className="flex gap-3">
                  <span className="text-gray-600">Birthday:</span>
                  <span>🎂 {user.dob && user.dob ? new Date(user.dob).toLocaleDateString('vi-VN') : 'N/A'}</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-gray-600">Balance:</span>
                  <span className="font-medium text-green-600">{user.tokenBalance.toLocaleString('vi-VN')} ₫</span>
                </div>

                {profile && (
                  <>
                    <div className="flex gap-3">
                      <span className="text-gray-600">Rating:</span>
                      <Badge count={`${profile.rating}/5`} style={{ backgroundColor: '#52c41a' }} />
                    </div>
                    <div className="flex gap-3">
                      <span className="text-gray-600">Verification Status:</span>
                      <Badge color={profile.isVerified ? 'green' : 'orange'} text={profile.isVerified ? 'Verified' : 'Pending'} />
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
                    {profile && !profile.isVerified && (
                      <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={handleRequestVerification}
                        loading={verifyLoading}
                        size="small"
                        style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                      >
                        Register Verify
                      </Button>
                    )}
                    <Button
                      icon={<FileTextOutlined />}
                      onClick={handleCheckCurrentRequest}
                      loading={checkRequestLoading}
                      size="small"
                    >
                      Check Request Status
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
                Professional Information
              </div>
            } className="shadow-sm">
              <div className="space-y-4">
                <div>
                  <div className="font-medium text-sm text-gray-700 mb-2">Specialization</div>
                  <p className="text-sm">{profile?.specialization || 'Not updated'}</p>
                </div>

                <div className="border-t pt-4">
                  <div className="font-medium text-sm text-gray-700 mb-2">Qualification</div>
                  <div className="space-y-1">
                    <div className="text-sm">🎓 {profile?.qualification || 'Not updated'}</div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="font-medium text-sm text-gray-700 mb-2">Experience</div>
                  <p className="text-sm">{profile?.experience || 'Not updated'}</p>
                </div>

                {profile?.certificateUrls && profile.certificateUrls.length > 0 && (
                  <div className="border-t pt-4">
                    <div className="font-medium text-sm text-gray-700 mb-2">Certificates</div>
                    <div className="space-y-1">
                      {profile.certificateUrls.map((url, index) => (
                        <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline block text-sm">
                          Certificate {index + 1}
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
                    Edit Professional Information
                  </Button>
                </div>
              </div>
            </Card>

            {/* Giới thiệu */}
            <Card title={
              <div className="flex items-center gap-2">
                <FileTextOutlined className="text-green-500" />
                About Me
              </div>
            } className="shadow-sm">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 leading-relaxed">{profile?.biography || 'Not updated'}</p>
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
              Create Teacher Profile
            </Button>
          </div>
        )}

        {/* Modals */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <EditOutlined className="text-blue-500" />
              Edit Personal Information
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
              {profile ? 'Edit Teacher Information' : 'Create Teacher Profile'}
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
              Change Password
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
