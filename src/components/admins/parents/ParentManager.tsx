import React, { useState } from "react";
import { 
  Table, 
  Button, 
  Tag, 
  Avatar, 
  Input, 
  Space, 
  Card,
  Typography,
  Tooltip,
  Dropdown,
  Badge,
  Select
} from "antd";
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  MoreOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  FilterOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { ParentData } from "~/types/parent";
import { parents } from "~/data/parents";

const { Title } = Typography;

const ParentManager: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState(parents);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [studentFilter, setStudentFilter] = useState<string>("all");

  const handleSearch = (value: string) => {
    setSearchText(value);
    applyFilters(value, statusFilter, studentFilter);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    applyFilters(searchText, value, studentFilter);
  };

  const handleStudentFilter = (value: string) => {
    setStudentFilter(value);
    applyFilters(searchText, statusFilter, value);
  };

  const applyFilters = (search: string, status: string, student: string) => {
    const filtered = parents.filter(parent => {
      const matchesSearch = parent.name.toLowerCase().includes(search.toLowerCase()) ||
                           parent.email.toLowerCase().includes(search.toLowerCase()) ||
                           parent.student.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = status === "all" || parent.status === status;
      
      const matchesStudent = student === "all" || parent.student === student;
      
      return matchesSearch && matchesStatus && matchesStudent;
    });
    setFilteredData(filtered);
  };

  // Get unique students for filter
  const uniqueStudents = [...new Set(parents.map(parent => parent.student))];

  const dropdownItems = (record: ParentData) => [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: `Edit ${record.name}`,
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: `Delete ${record.name}`,
      danger: true,
    },
  ];

  const columns: ColumnsType<ParentData> = [
    {
      title: (
        <Space>
          <UserOutlined />
          <span>Parent Information</span>
        </Space>
      ),
      dataIndex: "name",
      key: "name",
      width: 280,
      render: (text, record) => (
        <div className="flex items-center space-x-3">
          <Avatar 
            src={record.avatar} 
            size={48}
            className="shadow-sm border-2 border-gray-100"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">{text}</span>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <MailOutlined className="mr-1" />
              {record.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: (
        <Space>
          <PhoneOutlined />
          <span>Contact</span>
        </Space>
      ),
      dataIndex: "phone",
      key: "phone",
      width: 150,
      render: (phone) => (
        <span className="text-gray-700 font-medium">{phone}</span>
      ),
    },
    {
      title: "Student",
      dataIndex: "student",
      key: "student",
      width: 180,
      render: (student) => (
        <Badge 
          count={student} 
          style={{ 
            backgroundColor: '#f0f9ff', 
            color: '#0369a1',
            border: '1px solid #bae6fd'
          }} 
        />
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      align: 'center',
      render: (status) => (
        <Tag 
          color={status === "Active" ? "success" : "error"}
          className="px-3 py-1 rounded-full font-medium"
        >
          <div className="flex items-center">
            <div 
              className={`w-2 h-2 rounded-full mr-2 ${
                status === "Active" ? "bg-green-400" : "bg-red-400"
              }`} 
            />
            {status}
          </div>
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "action",
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit parent">
            <Button 
              type="text" 
              icon={<EditOutlined />}
              className="text-blue-600 hover:bg-blue-50"
            />
          </Tooltip>
          <Tooltip title="More actions">
            <Dropdown 
              menu={{ 
                items: dropdownItems(record),
                onClick: ({ key }) => {
                  console.log(`Action ${key} for parent:`, record.name);
                }
              }}
              trigger={['click']}
            >
              <Button 
                type="text" 
                icon={<MoreOutlined />}
                className="text-gray-600 hover:bg-gray-50"
              />
            </Dropdown>
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
              Parent Management
            </Title>
            <p className="text-gray-600 text-sm">
              Manage parent accounts and their information
            </p>
          </div>
          
          {/* Search and Add Button Section */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <Input.Search
              placeholder="Search by name, email, or student..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={handleSearch}
              allowClear
              className="max-w-md"
              prefix={<SearchOutlined className="text-gray-400" />}
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              className="bg-blue-600 hover:bg-blue-700 border-0 shadow-sm px-4 h-9 whitespace-nowrap"
            >
              Add New Parent
            </Button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2">
            <FilterOutlined className="text-gray-400" />
            <span className="text-sm text-gray-600">Filter by:</span>
          </div>
          
          <Select
            placeholder="Status"
            value={statusFilter}
            onChange={handleStatusFilter}
            className="min-w-32"
            options={[
              { label: "All Status", value: "all" },
              { label: "Active", value: "Active" },
              { label: "Inactive", value: "Inactive" }
            ]}
          />
          
          <Select
            placeholder="Student"
            value={studentFilter}
            onChange={handleStudentFilter}
            className="min-w-32"
            options={[
              { label: "All Students", value: "all" },
              ...uniqueStudents.map(student => ({
                label: student,
                value: student
              }))
            ]}
          />
          
          {(statusFilter !== "all" || studentFilter !== "all" || searchText) && (
            <Button 
              type="text" 
              size="small"
              onClick={() => {
                setSearchText("");
                setStatusFilter("all");
                setStudentFilter("all");
                setFilteredData(parents);
              }}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              Clear filters
            </Button>
          )}
          
          <div className="ml-auto text-sm text-gray-500">
            Showing {filteredData.length} of {parents.length} parents
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg border border-gray-200">
          <Table
            columns={columns}
            dataSource={filteredData}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} parents`,
              className: "px-4 py-2",
              size: "small"
            }}
            rowClassName="hover:bg-gray-50 transition-colors duration-200"
            className="overflow-x-auto"
            scroll={{ x: 800 }}
            size="middle"
          />
        </div>
      </Card>
    </div>
  );
};

export default ParentManager;