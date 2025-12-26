import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Tooltip,
  Avatar,
  Input,
  Space,
  Typography,
  Card,
  Modal,
  Descriptions,
  Tag,
  Divider,
  Popconfirm,
} from "antd";
import {
  SearchOutlined,
  CheckOutlined,
  EyeOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { UnverifiedTeacherProfile, AiReviewResponse } from "~/types/teacherProfile";
import { useTeacherProfile } from "~/hooks/useTeacherProfile";

const { Title } = Typography;

const TeacherManager: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState<UnverifiedTeacherProfile[]>([]);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isAiReviewModalVisible, setIsAiReviewModalVisible] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<UnverifiedTeacherProfile | null>(null);
  const [selectedAiReview, setSelectedAiReview] = useState<AiReviewResponse | null>(null);
  const { unverifiedProfiles, loading, fetchUnverifiedProfiles, verifyProfile } = useTeacherProfile();

  // Initialize data on component mount - call both APIs
  useEffect(() => {
    fetchUnverifiedProfiles();
  }, [fetchUnverifiedProfiles]);

  // Update filtered data when unverified profiles change
  useEffect(() => {
    setFilteredData(unverifiedProfiles);
  }, [unverifiedProfiles]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    if (!value.trim()) {
      setFilteredData(unverifiedProfiles);
      return;
    }

    const filtered = unverifiedProfiles.filter((profile) =>
      profile.firstName?.toLowerCase().includes(value.toLowerCase()) ||
      profile.lastName?.toLowerCase().includes(value.toLowerCase()) ||
      profile.email?.toLowerCase().includes(value.toLowerCase()) ||
      profile.teacherProfile?.specialization?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const handleVerifyProfile = async (profileId: string) => {
    const success = await verifyProfile(profileId);
    if (success) {
      // Refresh the list after successful verification
      await fetchUnverifiedProfiles();
    }
  };

  const handleViewProfile = (profile: UnverifiedTeacherProfile) => {
    setSelectedProfile(profile);
    setIsViewModalVisible(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalVisible(false);
    setSelectedProfile(null);
  };

  const handleViewAiReview = (review: AiReviewResponse | undefined) => {
    if (review) {
      setSelectedAiReview(review);
      setIsAiReviewModalVisible(true);
    }
  };

  const handleCloseAiReviewModal = () => {
    setIsAiReviewModalVisible(false);
    setSelectedAiReview(null);
  };

  // Get score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 4) return 'green';
    if (score >= 2) return 'orange';
    return 'red';
  };

  const columns: ColumnsType<UnverifiedTeacherProfile> = [
    {
      title: "Name",
      dataIndex: ["firstName", "lastName"],
      key: "name",
      render: (_, record) => {
        // Handle both API structures: direct fields or nested in user
        const firstName = record.firstName || record.user?.firstName;
        const lastName = record.lastName || record.user?.lastName;
        const imgUrl = record.imgUrl || record.user?.imgUrl;
        
        return (
          <div className="flex items-center gap-3">
            <Avatar
              src={imgUrl}
              size={48}
              className="shadow-sm border-2 border-gray-100"
            >
              {firstName?.charAt(0)}
            </Avatar>
            <span className="font-semibold text-gray-900">
              {firstName} {lastName}
            </span>
          </div>
        );
      },
    },
    {
      title: "Applied Date",
      dataIndex: "dob",
      key: "appliedDate",
      align: "center",
      render: (_, record) => {
        const dob = record.dob || record.user?.dob;
        return <span className="text-gray-600">{dob}</span>;
      },
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="View Profile">
            <Button
              icon={<EyeOutlined />}
              onClick={() => handleViewProfile(record)}
            />
          </Tooltip>
          {record.latestReview && (
            <Tooltip title="AI Review">
              <Button
                icon={<RobotOutlined />}
                onClick={() => handleViewAiReview(record.latestReview)}
                style={{ color: getScoreColor(record.latestReview.syllabusAlignment) }}
              />
            </Tooltip>
          )}
          <Tooltip title="Approve Profile">
            <Popconfirm
              title="Approve Teacher Profile"
              description="Are you sure you want to approve this teacher profile?"
              onConfirm={() => handleVerifyProfile(record.teacherProfile?.id || record.id || record.user?.id || '')}
              okText="Approve"
              cancelText="Cancel"
            >
              <Button
                type="primary"
                icon={<CheckOutlined />}
                className="bg-green-600 hover:bg-green-700"
                loading={loading}
              >
                Approve
              </Button>
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Card className="shadow-sm border-0">
        {/* Header Section */}
        <div className="mb-4">
          <div className="mb-3">
            <Title level={2} className="mb-1 text-gray-900">
              Teacher Profile Approvals
            </Title>
            <p className="text-gray-600 text-sm">Review and approve teacher profile applications</p>
          </div>

          {/* Search */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <Input.Search
              placeholder="Search by name, email, or specialization..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={handleSearch}
              allowClear
              className="max-w-md"
              prefix={<SearchOutlined className="text-gray-400" />}
            />
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => fetchUnverifiedProfiles()}
              loading={loading}
              className="bg-blue-600 hover:bg-blue-700 border-0"
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-4">
          <div className="text-sm text-gray-500">
            Showing {filteredData.length} of {unverifiedProfiles.length} pending approval{unverifiedProfiles.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <Table
            columns={columns}
            dataSource={filteredData}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} profile${total !== 1 ? 's' : ''}`,
              className: "px-4 py-2",
              size: "small",
            }}
            rowClassName="hover:bg-gray-50 transition-colors duration-200"
            className="overflow-x-auto"
            scroll={{ x: 800 }}
            size="middle"
            rowKey={(record) => record.teacherProfile?.id || record.id || record.user?.id || ''}
            loading={loading}
          />
        </div>
      </Card>

      {/* View Profile Modal */}
      <Modal
        title="Teacher Profile Details"
        open={isViewModalVisible}
        onCancel={handleCloseViewModal}
        footer={[
          <Button key="close" onClick={handleCloseViewModal}>
            Close
          </Button>,
        ]}
        width={800}
        centered
      >
        {selectedProfile && (() => {
          // Handle both API structures
          const firstName = selectedProfile.firstName || selectedProfile.user?.firstName;
          const lastName = selectedProfile.lastName || selectedProfile.user?.lastName;
          const email = selectedProfile.email || selectedProfile.user?.email;
          const imgUrl = selectedProfile.imgUrl || selectedProfile.user?.imgUrl;
          const dob = selectedProfile.dob || selectedProfile.user?.dob;
          const userId = selectedProfile.id || selectedProfile.user?.id;
          const roles = selectedProfile.roles || selectedProfile.user?.roles || [];
          
          return (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center gap-3">
              <Avatar
                src={imgUrl}
                size={80}
                className="shadow-md border-2 border-gray-200"
              >
                {firstName?.charAt(0)}
              </Avatar>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {firstName} {lastName}
                </h2>
                <p className="text-gray-600">{email}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {roles.map((role: string) => (
                    <Tag key={role} color="blue">
                      {role}
                    </Tag>
                  ))}
                </div>
              </div>
            </div>

            <Divider />

            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Date of Birth">
                  {dob || 'Not provided'}
                </Descriptions.Item>
                <Descriptions.Item label="User ID">
                  {userId}
                </Descriptions.Item>
              </Descriptions>
            </div>

            <Divider />

            {/* Teacher Profile */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Teacher Profile</h3>
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Qualification">
                  {selectedProfile.teacherProfile?.qualification || 'Not provided'}
                </Descriptions.Item>
                <Descriptions.Item label="Specialization">
                  {selectedProfile.teacherProfile?.specialization || 'Not provided'}
                </Descriptions.Item>
                <Descriptions.Item label="Experience">
                  {selectedProfile.teacherProfile?.experience || 'Not provided'}
                </Descriptions.Item>
                <Descriptions.Item label="Biography">
                  {selectedProfile.teacherProfile?.biography || 'Not provided'}
                </Descriptions.Item>
                <Descriptions.Item label="Rating">
                  {selectedProfile.teacherProfile?.rating ? `${selectedProfile.teacherProfile.rating}/5` : 'Not rated'}
                </Descriptions.Item>
                <Descriptions.Item label="Certificates">
                  {selectedProfile.teacherProfile?.certificateUrls?.length > 0
                    ? `${selectedProfile.teacherProfile.certificateUrls.length} certificate(s) uploaded`
                    : 'No certificates uploaded'
                  }
                  {selectedProfile.teacherProfile?.certificateUrls?.length > 0 && (
                    <div className="mt-2">
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {selectedProfile.teacherProfile.certificateUrls.map((url, index) => (
                          <li key={index}>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Certificate {index + 1}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Verification Status">
                  <Tag color={selectedProfile.teacherProfile?.isVerified ? 'green' : 'orange'}>
                    {selectedProfile.teacherProfile?.isVerified ? 'Verified' : 'Pending Verification'}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </div>
          </div>
        );
        })()}
      </Modal>

      {/* AI Review Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <RobotOutlined className="text-purple-500" />
            AI Review Analysis
          </div>
        }
        open={isAiReviewModalVisible}
        onCancel={handleCloseAiReviewModal}
        footer={[
          <Button key="close" onClick={handleCloseAiReviewModal}>
            Close
          </Button>,
        ]}
        width={600}
        centered
      >
        {selectedAiReview && (
          <div className="space-y-4">
            {/* Scores */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Evaluation Scores</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500">Syllabus Alignment</div>
                  <div className={`text-2xl font-bold text-${getScoreColor(selectedAiReview.syllabusAlignment)}-600`}>
                    {selectedAiReview.syllabusAlignment}/5
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500">Concept Accuracy</div>
                  <div className={`text-2xl font-bold text-${getScoreColor(selectedAiReview.conceptAccuracy)}-600`}>
                    {selectedAiReview.conceptAccuracy}/5
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500">Difficulty Fit</div>
                  <div className={`text-2xl font-bold text-${getScoreColor(selectedAiReview.difficultyFit)}-600`}>
                    {selectedAiReview.difficultyFit}/5
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500">Explanation Quality</div>
                  <div className={`text-2xl font-bold text-${getScoreColor(selectedAiReview.explanationQuality)}-600`}>
                    {selectedAiReview.explanationQuality}/5
                  </div>
                </div>
              </div>
            </div>

            <Divider />

            {/* Recommendation */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Recommendation</h3>
              <Tag 
                color={selectedAiReview.recommendation?.toLowerCase().includes('qualified') && !selectedAiReview.recommendation?.toLowerCase().includes('not') ? 'green' : 'red'}
                className="text-base px-3 py-1"
              >
                {selectedAiReview.recommendation}
              </Tag>
            </div>

            {/* Feedback */}
            <div>
              <h3 className="text-lg font-semibold mb-2">AI Feedback</h3>
              <div className="bg-blue-50 p-4 rounded-lg text-gray-700 leading-relaxed">
                {selectedAiReview.feedback}
              </div>
            </div>

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span><RobotOutlined /> Reviewed by: {selectedAiReview.reviewerType}</span>
              {selectedAiReview.createdAt && (
                <span>• {new Date(selectedAiReview.createdAt).toLocaleString()}</span>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TeacherManager;
