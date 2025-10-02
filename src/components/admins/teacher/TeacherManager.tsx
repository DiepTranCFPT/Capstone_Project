import React, { useState } from "react";
import {
  Table,
  Button,
  Tooltip,
  Avatar,
  Input,
  Space,
  Tag,
  Typography,
  Card,
  Select,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Teacher } from "~/types/teacher";
import { teachers } from "~/data/teacher";

const { Title } = Typography;

const TeacherManager: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState(teachers);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");

  const handleSearch = (value: string) => {
    setSearchText(value);
    applyFilters(value, statusFilter, subjectFilter);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    applyFilters(searchText, value, subjectFilter);
  };

  const handleSubjectFilter = (value: string) => {
    setSubjectFilter(value);
    applyFilters(searchText, statusFilter, value);
  };

  const applyFilters = (search: string, status: string, subject: string) => {
    const filtered = teachers.filter((teacher) => {
      const matchesSearch =
        teacher.fullName.toLowerCase().includes(search.toLowerCase()) ||
        teacher.email.toLowerCase().includes(search.toLowerCase()) ||
        teacher.subject.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = status === "all" || teacher.status === status;
      const matchesSubject =
        subject === "all" ||
        teacher.subject.split(", ").includes(subject);

      return matchesSearch && matchesStatus && matchesSubject;
    });
    setFilteredData(filtered);
  };

  // Get unique subjects for filter
  const allSubjects = teachers.flatMap((t) =>
    t.subject.split(",").map((s) => s.trim())
  );
  const uniqueSubjects = [...new Set(allSubjects)];

  const columns: ColumnsType<Teacher> = [
    {
      title: "Name",
      dataIndex: "fullName",
      key: "fullName",
      render: (text, record) => (
        <div className="flex items-center space-x-3">
          <Avatar
            src={record.avatarUrl}
            size={48}
            className="shadow-sm border-2 border-gray-100"
          >
            {record.fullName.charAt(0)}
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">{text}</span>
            <span className="text-sm text-gray-500">{record.email}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Teacher ID",
      dataIndex: "id",
      key: "id",
      render: (id) => <span className="text-gray-700 font-medium">{id}</span>,
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
      render: (subjects: string) => (
        <div className="flex flex-wrap gap-1">
          {subjects.split(",").map((subj, idx) => (
            <Tag key={idx} color="blue" className="text-xs">
              {subj.trim()}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: "Courses Assigned",
      dataIndex: "coursesAssigned",
      key: "coursesAssigned",
      align: "center",
      render: (courses) => (
        <span className="text-purple-600 font-semibold">{courses}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
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
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      render: (date) => <span className="text-gray-600">{date}</span>,
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="primary"
              icon={<EditOutlined />}
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => console.log("Edit:", record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => console.log("Delete:", record)}
            />
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
              Teachers Management
            </Title>
            <p className="text-gray-600 text-sm">Manage your teachers here</p>
          </div>

          {/* Search and Add Button */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <Input.Search
              placeholder="Search for teacher..."
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
              Add Teacher
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
              { label: "Inactive", value: "Inactive" },
            ]}
          />

          <Select
            placeholder="Subject"
            value={subjectFilter}
            onChange={handleSubjectFilter}
            className="min-w-36"
            options={[
              { label: "All Subjects", value: "all" },
              ...uniqueSubjects.map((subj) => ({
                label: subj,
                value: subj,
              })),
            ]}
          />

          {(statusFilter !== "all" ||
            subjectFilter !== "all" ||
            searchText) && (
            <Button
              type="text"
              size="small"
              onClick={() => {
                setSearchText("");
                setStatusFilter("all");
                setSubjectFilter("all");
                setFilteredData(teachers);
              }}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              Clear filters
            </Button>
          )}

          <div className="ml-auto text-sm text-gray-500">
            Showing {filteredData.length} of {teachers.length} teachers
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
                `${range[0]}-${range[1]} of ${total} teachers`,
              className: "px-4 py-2",
              size: "small",
            }}
            rowClassName="hover:bg-gray-50 transition-colors duration-200"
            className="overflow-x-auto"
            scroll={{ x: 800 }}
            size="middle"
            rowKey="id"
          />
        </div>
      </Card>
    </div>
  );
};

export default TeacherManager;
