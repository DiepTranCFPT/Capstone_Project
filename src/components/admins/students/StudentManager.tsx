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
  Select 
} from "antd";
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  FilterOutlined 
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { students } from "~/data/students";
import type { Student } from "~/types/student";

const { Title } = Typography;

const StudentManager: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState(students);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [parentFilter, setParentFilter] = useState<string>("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");

  const handleSearch = (value: string) => {
    setSearchText(value);
    applyFilters(value, statusFilter, parentFilter, courseFilter);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    applyFilters(searchText, value, parentFilter, courseFilter);
  };

  const handleParentFilter = (value: string) => {
    setParentFilter(value);
    applyFilters(searchText, statusFilter, value, courseFilter);
  };

  const handleCourseFilter = (value: string) => {
    setCourseFilter(value);
    applyFilters(searchText, statusFilter, parentFilter, value);
  };

  const applyFilters = (search: string, status: string, parent: string, course: string) => {
    const filtered = students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(search.toLowerCase()) ||
                           student.email.toLowerCase().includes(search.toLowerCase()) ||
                           (student.parentName?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
                           (Array.isArray(student.coursesEnrolled) 
                             ? student.coursesEnrolled.some(c => c.toLowerCase().includes(search.toLowerCase()))
                             : false);
      
      const matchesStatus = status === "all" || student.status === status;
      
      const matchesParent = parent === "all" || student.parentName === parent;
      
      const matchesCourse = course === "all" || 
                           (Array.isArray(student.coursesEnrolled) && student.coursesEnrolled.includes(course));
      
      return matchesSearch && matchesStatus && matchesParent && matchesCourse;
    });
    setFilteredData(filtered);
  };

  // Get unique values for filters
  const uniqueParents = [...new Set(students.map(student => student.parentName).filter(Boolean))];
  const allCourses = students.flatMap(student => Array.isArray(student.coursesEnrolled) ? student.coursesEnrolled : []);
  const uniqueCourses = [...new Set(allCourses)];

  const columns: ColumnsType<Student> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div className="flex items-center space-x-3">
          <Avatar 
            src={record.avatarUrl} 
            size={48}
            className="shadow-sm border-2 border-gray-100"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900">{text}</span>
            <span className="text-sm text-gray-500">{record.email}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (phone) => (
        <span className="text-gray-700 font-medium">{phone}</span>
      ),
    },
    {
      title: "Parent",
      dataIndex: "parentName",
      key: "parentName",
      render: (parent) => (
        <span className="text-gray-700">{parent || "N/A"}</span>
      ),
    },
    {
      title: "Course Enrolled",
      dataIndex: "coursesEnrolled",
      key: "coursesEnrolled",
      render: (courses?: string[]) => (
        <div className="flex flex-wrap gap-1">
          {Array.isArray(courses) && courses.length > 0 ? (
            courses.map((course, index) => (
              <Tag key={index} color="blue" className="text-xs">
                {course}
              </Tag>
            ))
          ) : (
            <span className="text-gray-400 text-sm">No courses</span>
          )}
        </div>
      ),
    },
    {
      title: "Progress",
      dataIndex: "progress",
      key: "progress",
      align: "center",
      render: (progress) => (
        <div className="flex flex-col items-center">
          <span className="text-purple-600 font-bold text-lg">{progress}%</span>
          <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
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
              Students Management
            </Title>
            <p className="text-gray-600 text-sm">
              Manage your students here
            </p>
          </div>
          
          {/* Search and Add Button Section */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <Input.Search
              placeholder="Search for student..."
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
              Add Student
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
            placeholder="Parent"
            value={parentFilter}
            onChange={handleParentFilter}
            className="min-w-36"
            options={[
              { label: "All Parents", value: "all" },
              ...uniqueParents.map(parent => ({
                label: parent,
                value: parent
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
          
          {(statusFilter !== "all" || parentFilter !== "all" || courseFilter !== "all" || searchText) && (
            <Button 
              type="text" 
              size="small"
              onClick={() => {
                setSearchText("");
                setStatusFilter("all");
                setParentFilter("all");
                setCourseFilter("all");
                setFilteredData(students);
              }}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              Clear filters
            </Button>
          )}
          
          <div className="ml-auto text-sm text-gray-500">
            Showing {filteredData.length} of {students.length} students
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
                `${range[0]}-${range[1]} of ${total} students`,
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

export default StudentManager;