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
    Modal.confirm({
      title: 'Approve Teacher Profile',
      content: 'Are you sure you want to approve this teacher profile?',
      okText: 'Approve',
      cancelText: 'Cancel',
      onOk: async () => {
        const success = await verifyProfile(profileId);
        if (success) {
          // Refresh the list after successful verification
          await fetchUnverifiedProfiles();
        }
      },
    });
  };

  const columns: ColumnsType<UnverifiedTeacherProfile> = [
    {
      title: "Name",
      dataIndex: ["firstName", "lastName"],
      key: "name",
      render: (_, record) => (
        <div className="flex items-center space-x-3">
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
              onClick={() => console.log("View:", record)}
            />
          </Tooltip>
          <Tooltip title="Approve Profile">
            <Button
              type="primary"
              icon={<CheckOutlined />}
              className="bg-green-600 hover:bg-green-700"
              onClick={() => handleVerifyProfile(record.teacherProfile.id)}
              loading={loading}
            >
              Approve
            </Button>
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
    </div>
  );
};

export default TeacherManager;
