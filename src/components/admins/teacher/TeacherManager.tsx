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
  Alert,
  Descriptions,
  Tag,
  Divider,
  Popconfirm,
} from "antd";
import {
  SearchOutlined,
  CheckOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { UnverifiedTeacherProfile } from "~/types/teacherProfile";
import { useTeacherProfile } from "~/hooks/useTeacherProfile";

const { Title } = Typography;

const TeacherManager: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState<UnverifiedTeacherProfile[]>([]);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<UnverifiedTeacherProfile | null>(null);
  const { unverifiedProfiles, loading, error, fetchUnverifiedProfiles, verifyProfile } = useTeacherProfile();

  // Initialize data on component mount
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
      profile.teacherProfile.specialization?.toLowerCase().includes(value.toLowerCase())
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

  const columns: ColumnsType<UnverifiedTeacherProfile> = [
    {
      title: "Name",
      dataIndex: ["firstName", "lastName"],
      key: "name",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={record.imgUrl}
            size={48}
            className="shadow-sm border-2 border-gray-100"
          >
            {record.firstName?.charAt(0)}
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">
              {record.firstName} {record.lastName}
            </span>
            <span className="text-sm text-gray-500">{record.email}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Qualification",
      dataIndex: ["teacherProfile", "qualification"],
      key: "qualification",
      render: (qualification) => <span className="text-gray-700">{qualification}</span>,
    },
    {
      title: "Specialization",
      dataIndex: ["teacherProfile", "specialization"],
      key: "specialization",
      render: (specialization) => <span className="text-gray-700">{specialization}</span>,
    },
    {
      title: "Experience",
      dataIndex: ["teacherProfile", "experience"],
      key: "experience",
      render: (experience) => <span className="text-gray-700">{experience}</span>,
    },
    {
      title: "Certificates",
      dataIndex: ["teacherProfile", "certificateUrls"],
      key: "certificates",
      render: (certificateUrls: string[]) => (
        <span className="text-purple-600 font-semibold">{certificateUrls?.length || 0}</span>
      ),
    },
    {
      title: "Applied Date",
      dataIndex: "dob",
      key: "appliedDate",
      align: "center",
      render: (date) => <span className="text-gray-600">{date}</span>,
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
          <Tooltip title="Approve Profile">
            <Popconfirm
              title="Approve Teacher Profile"
              description="Are you sure you want to approve this teacher profile?"
              onConfirm={() => handleVerifyProfile(record.teacherProfile.id)}
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

        {/* Error Alert */}
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            className="mb-4"
          />
        )}

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
            rowKey={(record) => record.teacherProfile.id}
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
        {selectedProfile && (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center gap-3">
              <Avatar
                src={selectedProfile.imgUrl}
                size={80}
                className="shadow-md border-2 border-gray-200"
              >
                {selectedProfile.firstName?.charAt(0)}
              </Avatar>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedProfile.firstName} {selectedProfile.lastName}
                </h2>
                <p className="text-gray-600">{selectedProfile.email}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedProfile.roles.map((role) => (
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
                  {selectedProfile.dob || 'Not provided'}
                </Descriptions.Item>
                <Descriptions.Item label="User ID">
                  {selectedProfile.id}
                </Descriptions.Item>
              </Descriptions>
            </div>

            <Divider />

            {/* Teacher Profile */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Teacher Profile</h3>
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Qualification">
                  {selectedProfile.teacherProfile.qualification || 'Not provided'}
                </Descriptions.Item>
                <Descriptions.Item label="Specialization">
                  {selectedProfile.teacherProfile.specialization || 'Not provided'}
                </Descriptions.Item>
                <Descriptions.Item label="Experience">
                  {selectedProfile.teacherProfile.experience || 'Not provided'}
                </Descriptions.Item>
                <Descriptions.Item label="Biography">
                  {selectedProfile.teacherProfile.biography || 'Not provided'}
                </Descriptions.Item>
                <Descriptions.Item label="Rating">
                  {selectedProfile.teacherProfile.rating ? `${selectedProfile.teacherProfile.rating}/5` : 'Not rated'}
                </Descriptions.Item>
                <Descriptions.Item label="Certificates">
                  {selectedProfile.teacherProfile.certificateUrls?.length > 0
                    ? `${selectedProfile.teacherProfile.certificateUrls.length} certificate(s) uploaded`
                    : 'No certificates uploaded'
                  }
                  {selectedProfile.teacherProfile.certificateUrls?.length > 0 && (
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
                  <Tag color={selectedProfile.teacherProfile.isVerified ? 'green' : 'orange'}>
                    {selectedProfile.teacherProfile.isVerified ? 'Verified' : 'Pending Verification'}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TeacherManager;
