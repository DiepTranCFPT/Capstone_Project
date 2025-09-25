import React, { useState } from "react";
import { 
  Table, 
  Button, 
  Tag, 
  Avatar, 
  Input, 
  Space, 
  Card, 
  Tooltip, 
  Typography,
  Select 
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { CourseData } from "~/types/course";
import { courses } from "~/data/courses";

const { Title } = Typography;

const CourseManager: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState(courses);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [teacherFilter, setTeacherFilter] = useState<string>("all");

  const handleSearch = (value: string) => {
    setSearchText(value);
    applyFilters(value, statusFilter, subjectFilter, teacherFilter);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    applyFilters(searchText, value, subjectFilter, teacherFilter);
  };

  const handleSubjectFilter = (value: string) => {
    setSubjectFilter(value);
    applyFilters(searchText, statusFilter, value, teacherFilter);
  };

  const handleTeacherFilter = (value: string) => {
    setTeacherFilter(value);
    applyFilters(searchText, statusFilter, subjectFilter, value);
  };

  const applyFilters = (search: string, status: string, subject: string, teacher: string) => {
    const filtered = courses.filter(course => {
      const matchesSearch = course.name.toLowerCase().includes(search.toLowerCase()) ||
                           course.subject.toLowerCase().includes(search.toLowerCase()) ||
                           course.teacher.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = status === "all" || course.status === status;
      
      const matchesSubject = subject === "all" || course.subject === subject;
      
      const matchesTeacher = teacher === "all" || course.teacher === teacher;
      
      return matchesSearch && matchesStatus && matchesSubject && matchesTeacher;
    });
    setFilteredData(filtered);
  };

  // Get unique values for filters
  const uniqueSubjects = [...new Set(courses.map(course => course.subject))];
  const uniqueTeachers = [...new Set(courses.map(course => course.teacher))];

  const columns: ColumnsType<CourseData> = [
    {
      title: "Thumbnail",
      dataIndex: "thumbnail",
      key: "thumbnail",
      width: 100,
      render: (thumbnail) => (
        <Avatar shape="square" size={60} src={thumbnail} />
      ),
    },
    {
      title: "Course Name",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (text) => <span className="font-semibold">{text}</span>,
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
      width: 120,
    },
    {
      title: "Teacher",
      dataIndex: "teacher",
      key: "teacher",
      width: 150,
    },
    {
      title: "Students Enrolled",
      dataIndex: "studentsEnrolled",
      key: "studentsEnrolled",
      align: "center",
      width: 150,
    },
    {
      title: "Resources",
      dataIndex: "resources",
      key: "resources",
      align: "center",
      width: 120,
    },
    {
      title: "Mock Tests",
      dataIndex: "mockTests",
      key: "mockTests",
      align: "center",
      width: 120,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag color={status === "Active" ? "success" : "error"}>{status}</Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 180,
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="View">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              className="bg-green-500 hover:bg-green-600 border-0"
              onClick={() => console.log("View:", record)}
            >
              View
            </Button>
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="primary"
              icon={<EditOutlined />}
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
              Courses Management
            </Title>
            <p className="text-gray-600 text-sm">
              Manage your courses here
            </p>
          </div>
          
          {/* Search and Add Button Section */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <Input.Search
              placeholder="Search for courses..."
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
              Add Course
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
            placeholder="Subject"
            value={subjectFilter}
            onChange={handleSubjectFilter}
            className="min-w-32"
            options={[
              { label: "All Subjects", value: "all" },
              ...uniqueSubjects.map(subject => ({
                label: subject,
                value: subject
              }))
            ]}
          />

          <Select
            placeholder="Teacher"
            value={teacherFilter}
            onChange={handleTeacherFilter}
            className="min-w-32"
            options={[
              { label: "All Teachers", value: "all" },
              ...uniqueTeachers.map(teacher => ({
                label: teacher,
                value: teacher
              }))
            ]}
          />
          
          {(statusFilter !== "all" || subjectFilter !== "all" || teacherFilter !== "all" || searchText) && (
            <Button 
              type="text" 
              size="small"
              onClick={() => {
                setSearchText("");
                setStatusFilter("all");
                setSubjectFilter("all");
                setTeacherFilter("all");
                setFilteredData(courses);
              }}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              Clear filters
            </Button>
          )}
          
          <div className="ml-auto text-sm text-gray-500">
            Showing {filteredData.length} of {courses.length} courses
          </div>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} courses`,
            className: "px-4 py-2",
            size: "small"
          }}
          rowClassName="hover:bg-gray-50 transition-colors duration-200"
          className="bg-white rounded-lg border border-gray-200 overflow-x-auto"
          scroll={{ x: 800 }}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default CourseManager;