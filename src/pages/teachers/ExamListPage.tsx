import React, { useState, useMemo } from "react";
import { Button, Table, Tag, Input, Select, Space } from "antd";
import { EyeOutlined, PlusOutlined, SearchOutlined, EditOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import { useMyExamTemplates } from "~/hooks/useMyExam";
// import { useAuth } from "~/hooks/useAuth";
import type { ExamTemplate, ExamRule } from "~/types/test";

const { Option } = Select;

const ExamListPage: React.FC = () => {
  const navigate = useNavigate();
  // const { user } = useAuth();
  const { templates, loading, pageNo, pageSize, totalElements, handlePageChange } = useMyExamTemplates();

  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const clearFilters = () => {
    setSearchText('');
    setSelectedStatus('all');
  };

  const handleViewDetails = (templateId: string) => {
    navigate(`/teacher/template-details/${templateId}`);
  };

  const handleEdit = (templateId: string) => {
    navigate(`/teacher/edit-template/${templateId}`);
  };

  const handleCreateNew = () => {
    navigate('/teacher/create-template');
  };

  const filteredData = useMemo(() => {
    return (templates || [])
      .filter(template => {
        if (searchText && !template.title.toLowerCase().includes(searchText.toLowerCase())) return false;
        if (selectedStatus !== 'all') {
          const isActive = selectedStatus === 'active';
          if (template.isActive !== isActive) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
  }, [templates, searchText, selectedStatus]);

  const columns: ColumnsType<ExamTemplate> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => (
        <div className="font-medium text-gray-900">{title}</div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (description: string) => (
        <div className="text-gray-600 text-sm max-w-xs truncate">{description || 'No description'}</div>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number) => `${duration} min`,
    },
    {
      title: 'Passing Score',
      dataIndex: 'passingScore',
      key: 'passingScore',
      render: (score: number) => `${score}%`,
    },
    {
      title: 'Rules',
      dataIndex: 'rules',
      key: 'rules',
      render: (rules: ExamRule[]) => rules?.length || 0,
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
      dataIndex: 'createdBy',
      key: 'createdBy',
      render: (createdBy: string) => createdBy,
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
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.id)}
            size="small"
          >
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Exam Templates</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={handleCreateNew}
        >
          Create New Template
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex gap-4 flex-wrap">
        <Input
          placeholder="Search templates"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 250 }}
        />

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

      {/* Template Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-blue-600">{templates?.length || 0}</div>
          <div className="text-sm text-gray-600">Total Templates</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-green-600">
            {templates?.filter(t => t.isActive).length || 0}
          </div>
          <div className="text-sm text-gray-600">Active Templates</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-orange-600">
            {templates?.filter(t => !t.isActive).length || 0}
          </div>
          <div className="text-sm text-gray-600">Inactive Templates</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="text-2xl font-bold text-purple-600">
            {templates?.reduce((sum, template) => sum + (template.rules?.length || 0), 0) || 0}
          </div>
          <div className="text-sm text-gray-600">Total Rules</div>
        </div>
      </div>

      {/* Template Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pageNo,
            pageSize,
            total: totalElements,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} templates`,
            onChange: handlePageChange,
          }}
        />
      </div>
    </div>
  );
};

export default ExamListPage;
