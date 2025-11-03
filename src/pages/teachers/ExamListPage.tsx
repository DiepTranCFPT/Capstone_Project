import React, { useState, useMemo, useEffect } from "react";
import { Button, Table, Tag, Input, Select, Space } from "antd";
import { EyeOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import { useExams } from "~/hooks/useExams";
import { useAuth } from "~/hooks/useAuth";
import type { ApiExam } from "~/types/test";

const { Option } = Select;

const ExamListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { exams, loading, fetchExamsByUserId } = useExams();

  const [searchText, setSearchText] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All Subjects');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Fetch exams when component mounts
  useEffect(() => {
    if (user?.id) {
      fetchExamsByUserId(user.id);
    }
  }, [user?.id, fetchExamsByUserId]);

  const clearFilters = () => {
    setSearchText('');
    setSelectedSubject('All Subjects');
    setSelectedStatus('all');
  };

  const handleViewDetails = (examId: string) => {
    navigate(`/teacher/exam-details/${examId}`);
  };


  const handleCreateNew = () => {
    navigate('/teacher/create-exam');
  };

  const filteredData = useMemo(() => {
    return (exams || [])
      .filter(exam => {
        if (searchText && !exam.title.toLowerCase().includes(searchText.toLowerCase())) return false;
        if (selectedSubject !== 'All Subjects' && !exam.subjectNames?.includes(selectedSubject)) return false;
        if (selectedStatus !== 'all') {
          const isActive = selectedStatus === 'active';
          if (exam.isActive !== isActive) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [exams, searchText, selectedSubject, selectedStatus]);

  const columns: ColumnsType<ApiExam> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => (
        <div className="font-medium text-gray-900">{title}</div>
      ),
    },
    {
      title: 'Subjects',
      dataIndex: 'subjectNames',
      key: 'subjectNames',
      render: (subjects: string[]) => (
        <div className="flex flex-wrap gap-1">
          {subjects?.slice(0, 2).map((subject, index) => (
            <Tag key={index} color="blue">
              {subject}
            </Tag>
          ))}
          {subjects && subjects.length > 2 && (
            <Tag>+{subjects.length - 2} more</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => `${duration} min`,
    },
    {
      title: 'Questions',
      dataIndex: 'questionContents',
      key: 'questionContents',
      render: (questions: string[]) => questions?.length || 0,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record.id)}
            size="small"
          >
            View
          </Button>         
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Exams</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={handleCreateNew}
        >
          Create New Exam
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex gap-4 flex-wrap">
        <Input
          placeholder="Search exams"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 250 }}
        />

        <Select
          value={selectedSubject}
          onChange={setSelectedSubject}
          style={{ width: 150 }}
        >
          <Option value="All Subjects">All Subjects</Option>
          <Option value="Biology">Biology</Option>
          <Option value="Mathematics">Mathematics</Option>
          <Option value="Physics">Physics</Option>
          <Option value="History">History</Option>
        </Select>

        <Select
          value={selectedStatus}
          onChange={setSelectedStatus}
          style={{ width: 120 }}
        >
          <Option value="all">All Status</Option>
          <Option value="active">Active</Option>
          <Option value="inactive">Inactive</Option>
        </Select>

        <Button onClick={clearFilters}>Clear Filters</Button>
      </div>

      {/* Exam Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-blue-600">{exams?.length || 0}</div>
          <div className="text-sm text-gray-600">Total Exams</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-green-600">
            {exams?.filter(e => e.isActive).length || 0}
          </div>
          <div className="text-sm text-gray-600">Active Exams</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-orange-600">
            {exams?.filter(e => !e.isActive).length || 0}
          </div>
          <div className="text-sm text-gray-600">Inactive Exams</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-purple-600">
            {exams?.reduce((sum, exam) => sum + (exam.questionContents?.length || 0), 0) || 0}
          </div>
          <div className="text-sm text-gray-600">Total Questions</div>
        </div>
      </div>

      {/* Exam Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} exams`,
          }}
        />
      </div>
    </div>
  );
};

export default ExamListPage;
