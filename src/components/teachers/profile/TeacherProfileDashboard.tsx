import React, { useState } from "react";
import { Card, Tag, Button, Spin, Badge, Modal, Row, Col, Statistic } from "antd";
import { EditOutlined, LockOutlined, EnvironmentOutlined, FileTextOutlined } from "@ant-design/icons";
import { useAuth } from "~/hooks/useAuth";
import { getCurrentUserApi } from "~/services/authService";
import { toast } from "~/components/common/Toast";
import type { TeacherProfile, TeacherStat } from "~/types/teacherProfile";
import TeacherChangePasswordForm from "./TeacherChangePasswordForm";
import EditTeacherProfileForm from "./EditTeacherProfileForm";
import AvatarUpload from "~/components/students/profile/AvatarUpload";

// Mock teacher profile data
const mockTeacherProfile: TeacherProfile = {
    id: "tp1",
    teacherId: "teacher1",
    qualifications: ["Bachelor of Education", "Master of Teaching"],
    teachingSubjects: ["AP Calculus BC", "AP Physics C", "SAT Math", "ACT Math"],
    yearsOfExperience: 8,
    certifications: [
        {
            id: "cert1",
            name: "Advanced Placement Calculus Certified",
            issuer: "College Board",
            issueDate: "2023-09-01",
            expiryDate: "2026-09-01"
        },
        {
            id: "cert2",
            name: "SAT Math Specialist",
            issuer: "College Board",
            issueDate: "2022-03-15"
        }
    ],
    bio: "Experienced AP and SAT math tutor with 8 years of experience. Passionate about helping students achieve their academic goals and develop confidence in mathematics.",
    hourlyRate: 50,
    rating: 4.8,
    totalStudents: 125,
    completedSessions: 480,
    createdExams: 45,
    linkedInProfile: "https://linkedin.com/in/johnsmith-teacher",
    portfolio: "https://johnsmith-teaching.com",
    teachingPhilosophy: "Every student has the potential to excel when provided with the right tools and support. I believe in personalized learning approaches and building strong problem-solving skills.",
    preferredLocation: "Online/Virtual",
    availabilityStatus: "available"
};

const TeacherProfileDashboard: React.FC = () => {
    const { user, loading: authLoading, logout } = useAuth();
    const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
    const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);

    // Stats for teacher dashboard
    const teacherStats: Omit<TeacherStat, 'icon'>[] = [
        { label: "Total Students", value: mockTeacherProfile.totalStudents, color: "#1890ff" },
        { label: "Completed Sessions", value: mockTeacherProfile.completedSessions, color: "#52c41a" },
        { label: "Created Exams", value: mockTeacherProfile.createdExams, color: "#722ed1" },
        { label: "Average Rating", value: `${mockTeacherProfile.rating}/5`, color: "#faad14" },
        { label: "Hourly Rate", value: `$${mockTeacherProfile.hourlyRate}`, color: "#13c2c2" },
        { label: "Experience", value: `${mockTeacherProfile.yearsOfExperience} years`, color: "#eb2f96" },
    ];

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                  <span>🎂 {user.dob ? new Date(user.dob).toLocaleDateString('vi-VN') : 'N/A'}</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-gray-600">Token:</span>
                  <span className="font-medium text-green-600">{user.tokenBalance}</span>
                </div>

                <div className="flex gap-3">
                  <span className="text-gray-600">Địa điểm:</span>
                  <span className="flex items-center gap-1">
                    <EnvironmentOutlined className="w-3 h-3" />
                    {mockTeacherProfile.preferredLocation}
                  </span>
                </div>
                <div className="flex gap-3">
                  <span className="text-gray-600">Trạng thái:</span>
                  <Badge
                    status={mockTeacherProfile.availabilityStatus === 'available' ? 'success' :
                           mockTeacherProfile.availabilityStatus === 'busy' ? 'warning' : 'error'}
                    text={mockTeacherProfile.availabilityStatus}
                  />
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

            {/* Quick Stats */}
            <Card title="Thống kê tổng quan" className="shadow-sm">
              <Row gutter={[16, 16]}>
                {teacherStats.map((stat, index) => (
                  <Col xs={24} sm={12} key={index}>
                    <Card size="small" className="text-center">
                      <Statistic
                        title={stat.label}
                        value={stat.value}
                        valueStyle={{ color: stat.color, fontSize: '16px', fontWeight: 'bold' }}
                        className="text-sm"
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </div>
        </Card>

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
                <div className="font-medium text-sm text-gray-700 mb-2">Môn học dạy</div>
                <div className="flex flex-wrap gap-1">
                  {mockTeacherProfile.teachingSubjects.map((subject, index) => (
                    <Tag key={index} color="blue">{subject}</Tag>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="font-medium text-sm text-gray-700 mb-2">Trình độ học vấn</div>
                <div className="space-y-1">
                  {mockTeacherProfile.qualifications.map((qual, index) => (
                    <div key={index} className="text-sm">🎓 {qual}</div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="font-medium text-sm text-gray-700 mb-2">Chứng chỉ</div>
                <div className="space-y-2">
                  {mockTeacherProfile.certifications.map((cert, index) => (
                    <div key={index} className="text-xs p-2 bg-gray-50 rounded">
                      <div className="font-medium">{cert.name}</div>
                      <div className="text-gray-600">{cert.issuer} • {cert.issueDate}</div>
                    </div>
                  ))}
                </div>
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
                <div className="font-medium text-sm text-gray-700 mb-2">Giới thiệu</div>
                <p className="text-sm text-gray-600 leading-relaxed">{mockTeacherProfile.bio}</p>
              </div>

              {mockTeacherProfile.teachingPhilosophy && (
                <div className="border-t pt-4">
                  <div className="font-medium text-sm text-gray-700 mb-2">Triết lý dạy học</div>
                  <p className="text-sm text-gray-600 leading-relaxed">{mockTeacherProfile.teachingPhilosophy}</p>
                </div>
              )}

              {(mockTeacherProfile.linkedInProfile || mockTeacherProfile.portfolio) && (
                <div className="border-t pt-4">
                  <div className="font-medium text-sm text-gray-700 mb-2">Liên kết</div>
                  <div className="space-y-1 text-sm">
                    {mockTeacherProfile.linkedInProfile && (
                      <a href={mockTeacherProfile.linkedInProfile} target="_blank" rel="noopener noreferrer"
                         className="text-blue-600 hover:underline">LinkedIn Profile</a>
                    )}
                    {mockTeacherProfile.portfolio && (
                      <a href={mockTeacherProfile.portfolio} target="_blank" rel="noopener noreferrer"
                         className="text-blue-600 hover:underline ml-3">Portfolio Website</a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Modals */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <EditOutlined className="text-blue-500" />
              Chỉnh sửa thông tin giáo viên
            </div>
          }
          open={editProfileModalVisible}
          onCancel={() => setEditProfileModalVisible(false)}
          footer={null}
          width={700}
          destroyOnClose
        >
          <EditTeacherProfileForm
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