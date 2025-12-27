import React, { useState } from "react";
import {
  Table,
  Button,
  Tooltip,
  Input,
  Space,
  Typography,
  Card,
  Modal,
  Form,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Subject } from "~/types/subject";
import { useSubjects } from "~/hooks/useSubjects";
import { toast } from "~/components/common/Toast";

const { Title } = Typography;
const { TextArea } = Input;

const SubjectManager: React.FC = () => {
  const {
    subjects,
    pageInfo,
    loading,
    fetchSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
  } = useSubjects();

  const [searchText, setSearchText] = useState("");
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingSubjectId, setDeletingSubjectId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    fetchSubjects({ pageNo, pageSize, keyword: searchText || undefined });
  }, [pageNo, pageSize, searchText, fetchSubjects]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPageNo(1); // Reset to first page when searching
  };

  const handlePageChange = (page: number, size: number) => {
    setPageNo(page);
    if (size !== pageSize) {
      setPageSize(size);
      setPageNo(1); // Reset to first page when page size changes
    }
  };

  const handleAddSubject = () => {
    setEditingSubject(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEditSubject = (record: Subject) => {
    setEditingSubject(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
    });
    setIsModalOpen(true);
  };

  const handleDeleteSubject = (id: string) => {
    setDeletingSubjectId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingSubjectId) return;
    try {
      await deleteSubject(deletingSubjectId);
      toast.success("Subject deleted successfully");
      fetchSubjects();
      setIsDeleteModalOpen(false);
      setDeletingSubjectId(null);
    } catch (error) {
      toast.error("Failed to delete subject");
      console.log(error)
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDeletingSubjectId(null);
  };

  const handleModalOk = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();
      if (editingSubject) {
        await updateSubject(editingSubject.id, values);
        // toast.success("Subject updated successfully");
      } else {
        await createSubject(values);

        // toast.success("Subject created successfully");
      }
      setIsModalOpen(false);
      fetchSubjects();
    } catch (error) {
      toast.error("Failed to save subject");
      console.log(error);
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnsType<Subject> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name) => <span className="font-semibold text-gray-900">{name}</span>,
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      render: (code) => <span className="font-semibold text-gray-900">{code}</span>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (description) => (
        <span className="text-gray-600">
          {description || "No description"}
        </span>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      render: (date) => (
        <span className="text-gray-600">
          {date ? new Date(date).toLocaleDateString() : "N/A"}
        </span>
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
              onClick={() => handleEditSubject(record)}
            />
          </Tooltip>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteSubject(record.id)}
          />
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
              Subjects Management
            </Title>
            <p className="text-gray-600 text-sm">Manage subjects here</p>
          </div>

          {/* Search and Add Button */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <Input.Search
              placeholder="Search subjects..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={handleSearch}
              allowClear
              className="max-w-md"
              prefix={<SearchOutlined className="text-gray-400" />}
              loading={loading}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="bg-blue-600 hover:bg-blue-700 border-0 shadow-sm px-4 h-9 whitespace-nowrap"
              onClick={handleAddSubject}
            >
              Add Subject
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <Table
            columns={columns}
            dataSource={subjects}
            pagination={{
              current: pageNo,
              pageSize: pageSize,
              total: pageInfo?.totalElement ?? pageInfo?.totalElements ?? 0,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} subjects`,
              className: "px-4 py-2",
              size: "small",
              onChange: handlePageChange,
            }}
            rowClassName="hover:bg-gray-50 transition-colors duration-200"
            className="overflow-x-auto"
            scroll={{ x: 800 }}
            size="middle"
            rowKey="id"
            loading={loading}
          />
        </div>

        {/* Modal for Add/Edit */}
        <Modal
          title={editingSubject ? "Edit Subject" : "Add Subject"}
          open={isModalOpen}
          onOk={handleModalOk}
          onCancel={() => setIsModalOpen(false)}
          confirmLoading={saving}
        >
          <Form form={form} layout="vertical" className="mt-4">
            <Form.Item
              name="name"
              label="Subject Name"
              rules={[{ required: true, message: "Please enter subject name" }]}
            >
              <Input placeholder="Enter subject name" />
            </Form.Item>

            <Form.Item name="description" label="Description">
              <TextArea
                placeholder="Enter subject description"
                rows={4}
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal for Delete Confirmation */}
        <Modal
          title="Delete Subject"
          open={isDeleteModalOpen}
          onOk={handleConfirmDelete}
          onCancel={handleCancelDelete}
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
        >
          <p>Are you sure you want to delete this subject? This action cannot be undone.</p>
        </Modal>
      </Card>
    </div>
  );
};

export default SubjectManager;
