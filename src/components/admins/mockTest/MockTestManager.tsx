import React, { useState } from "react";
import { 
  Table, 
  Button, 
  Space, 
  Input, 
  Tooltip, 
  Typography, 
  Card, 
  Select, 
  Tag 
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import type { MockTestData } from "~/types/mockTest";
import { mockTests } from "~/data/mockTests.tsmockTests";

const { Title } = Typography;

const MockTestManager: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState<MockTestData[]>(mockTests);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");

  const handleSearch = (value: string) => {
    setSearchText(value);
    applyFilters(value, statusFilter, typeFilter, courseFilter);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    applyFilters(searchText, value, typeFilter, courseFilter);
  };

  const handleTypeFilter = (value: string) => {
    setTypeFilter(value);
    applyFilters(searchText, statusFilter, value, courseFilter);
  };

  const handleCourseFilter = (value: string) => {
    setCourseFilter(value);
    applyFilters(searchText, statusFilter, typeFilter, value);
  };

  const applyFilters = (search: string, status: string, type: string, course: string) => {
    const filtered = mockTests.filter(test => {
      const matchesSearch = test.name.toLowerCase().includes(search.toLowerCase()) ||
                           test.course.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = status === "all" || test.status === status;
      
      const matchesType = type === "all" || test.type === type;
      
      const matchesCourse = course === "all" || test.course === course;
      
      return matchesSearch && matchesStatus && matchesType && matchesCourse;
    });
    setFilteredData(filtered);
  };

  // Get unique values for filters
  const uniqueStatuses = [...new Set(mockTests.map(test => test.status))];
  const uniqueTypes = [...new Set(mockTests.map(test => test.type))];
  const uniqueCourses = [...new Set(mockTests.map(test => test.course))];

  // --- Handlers ---
  const handleView = (record: MockTestData): void => {
    console.log("View:", record);
  };

  const handleEdit = (record: MockTestData): void => {
    console.log("Edit:", record);
  };

  const handleDelete = (record: MockTestData): void => {
    const newData = filteredData.filter((item) => item.key !== record.key);
    setFilteredData(newData);

    // const updatedMockTests = mockTests.filter((item) => item.key !== record.key);

  };

  const columns: ColumnsType<MockTestData> = [
    { 
      title: "Test Name", 
      dataIndex: "name", 
      key: "name",
      render: (text) => <span className="font-semibold text-gray-900">{text}</span>
    },
    { 
      title: "Course", 
      dataIndex: "course", 
      key: "course",
      render: (course) => (
        <Tag color="blue" className="text-xs">{course}</Tag>
      )
    },
    { 
      title: "Questions", 
      dataIndex: "questions", 
      key: "questions",
      align: "center",
      render: (questions) => (
        <span className="font-medium text-purple-600">{questions}</span>
      )
    },
    { 
      title: "Type", 
      dataIndex: "type", 
      key: "type",
      render: (type) => (
        <Tag color={type === "Practice" ? "green" : "orange"} className="text-xs">
          {type}
        </Tag>
      )
    },
    { 
      title: "Duration", 
      dataIndex: "duration", 
      key: "duration",
      align: "center",
      render: (duration) => (
        <span className="text-gray-700 font-medium">{duration}</span>
      )
    },
    { 
      title: "Attempts", 
      dataIndex: "attempts", 
      key: "attempts",
      align: "center",
      render: (attempts) => (
        <span className="text-blue-600 font-bold">{attempts}</span>
      )
    },
    { 
      title: "Status", 
      dataIndex: "status", 
      key: "status",
      align: "center",
      render: (status) => (
        <Tag 
          color={status === "Active" ? "success" : status === "Draft" ? "warning" : "error"}
          className="px-3 py-1 rounded-full font-medium"
        >
          <div className="flex items-center">
            <div 
              className={`w-2 h-2 rounded-full mr-2 ${
                status === "Active" ? "bg-green-400" : 
                status === "Draft" ? "bg-yellow-400" : "bg-red-400"
              }`} 
            />
            {status}
          </div>
        </Tag>
      )
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="View">
            <Button
              icon={<EyeOutlined />}
              type="primary"
              className="bg-green-500 hover:bg-green-600 border-0"
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              type="primary"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDelete(record)}
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
              Mock Test Management
            </Title>
            <p className="text-gray-600 text-sm">
              Manage your mock tests here
            </p>
          </div>
          
          {/* Search and Add Button Section */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <Input.Search
              placeholder="Search mock test..."
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
              Create Mock Test
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
              ...uniqueStatuses.map(status => ({
                label: status,
                value: status
              }))
            ]}
          />
          
          <Select
            placeholder="Type"
            value={typeFilter}
            onChange={handleTypeFilter}
            className="min-w-32"
            options={[
              { label: "All Types", value: "all" },
              ...uniqueTypes.map(type => ({
                label: type,
                value: type
              }))
            ]}
          />

          <Select
            placeholder="Course"
            value={courseFilter}
            onChange={handleCourseFilter}
            className="min-w-36"
            options={[
              { label: "All Courses", value: "all" },
              ...uniqueCourses.map(course => ({
                label: course,
                value: course
              }))
            ]}
          />
          
          {(statusFilter !== "all" || typeFilter !== "all" || courseFilter !== "all" || searchText) && (
            <Button 
              type="text" 
              size="small"
              onClick={() => {
                setSearchText("");
                setStatusFilter("all");
                setTypeFilter("all");
                setCourseFilter("all");
                setFilteredData(mockTests);
              }}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              Clear filters
            </Button>
          )}
          
          <div className="ml-auto text-sm text-gray-500">
            Showing {filteredData.length} of {mockTests.length} mock tests
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg border border-gray-200">
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="key"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} mock tests`,
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

export default MockTestManager;