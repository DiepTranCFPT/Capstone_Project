import React, { useState, useCallback, useEffect } from "react";
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
    Select,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { SorterResult } from "antd/es/table/interface";
import type { QuestionTopic } from "~/types/questionTopic";
import { useQuestionTopics } from "~/hooks/useQuestionTopics";
import { useSubjects } from "~/hooks/useSubjects";
import { toast } from "~/components/common/Toast";

const { Title } = Typography;
const { TextArea } = Input;

const QuestionTopicManager: React.FC = () => {
    const {
        topics,
        pageInfo,
        loading,
        fetchTopicsBySubject,
        fetchTopics,
        createTopic,
        updateTopic,
        deleteTopic,
    } = useQuestionTopics();

    const { subjects, fetchSubjects } = useSubjects();

    const [searchText, setSearchText] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTopic, setEditingTopic] = useState<QuestionTopic | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingTopicId, setDeletingTopicId] = useState<string | null>(null);
    const [form] = Form.useForm();
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Pagination & Sorting state
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
    });
    const [sortField, setSortField] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<"ascend" | "descend" | null>(null);

    useEffect(() => {
        fetchSubjects();
    }, [fetchSubjects]);

    // Fetch topics with server-side pagination and sorting
    const loadTopics = useCallback(async () => {
        const sorts: string[] = [];
        if (sortField && sortOrder) {
            // Format: "fieldName,asc" or "fieldName,desc"
            const order = sortOrder === "ascend" ? "asc" : "desc";
            sorts.push(`${sortField}:${order}`);
        }

        if (selectedSubject) {
            await fetchTopicsBySubject(selectedSubject);
        } else {
            await fetchTopics({
                pageNo: pagination.current - 1, // API uses 0-based page
                pageSize: pagination.pageSize,
                keyword: searchText || undefined,
                sorts: sorts.length > 0 ? sorts : undefined,
            });
        }
    }, [fetchTopics, fetchTopicsBySubject, pagination.current, pagination.pageSize, searchText, sortField, sortOrder, selectedSubject]);

    useEffect(() => {
        loadTopics();
    }, [loadTopics]);

    // Handle table change (pagination, sorting)
    const handleTableChange = (
        newPagination: TablePaginationConfig,
        _filters: Record<string, unknown>,
        sorter: SorterResult<QuestionTopic> | SorterResult<QuestionTopic>[]
    ) => {
        // Update pagination
        setPagination({
            current: newPagination.current || 1,
            pageSize: newPagination.pageSize || 10,
        });

        // Handle sorting
        const singleSorter = Array.isArray(sorter) ? sorter[0] : sorter;
        if (singleSorter && singleSorter.field) {
            setSortField(singleSorter.field as string);
            setSortOrder(singleSorter.order || null);
        } else {
            setSortField(null);
            setSortOrder(null);
        }
    };

    // Handle search with debounce reset to page 1
    const handleSearch = (value: string) => {
        setSearchText(value);
        setPagination((prev) => ({ ...prev, current: 1 })); // Reset to first page
    };

    const handleSubjectFilter = (value: string | null) => {
        setSelectedSubject(value);
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    const handleAddTopic = () => {
        setEditingTopic(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEditTopic = (record: QuestionTopic) => {
        setEditingTopic(record);
        form.setFieldsValue({
            name: record.name,
            description: record.description,
            subjectId: record.subjectId || record.subject,
        });
        setIsModalOpen(true);
    };

    const handleDeleteTopic = (id: string) => {
        setDeletingTopicId(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deletingTopicId) return;
        try {
            await deleteTopic(deletingTopicId);
            setIsDeleteModalOpen(false);
            setDeletingTopicId(null);
            // Reload topics after delete
            loadTopics();
        } catch (error) {
            console.log(error);
        }
    };

    const handleCancelDelete = () => {
        setIsDeleteModalOpen(false);
        setDeletingTopicId(null);
    };

    const handleModalOk = async () => {
        try {
            setSaving(true);
            const values = await form.validateFields();
            if (editingTopic) {
                await updateTopic(editingTopic.id, values);
            } else {
                await createTopic(values);
            }
            setIsModalOpen(false);
            // Reload topics after create/update
            loadTopics();
        } catch (error) {
            toast.error("Failed to save question topic");
            console.log(error);
        } finally {
            setSaving(false);
        }
    };

    // Get subject name by ID
    const getSubjectName = (topic: QuestionTopic) => {
        if (topic.subjectName) return topic.subjectName;
        if (topic.subject) {
            const subject = subjects.find(s => s.id === topic.subject);
            return subject?.name || topic.subject;
        }
        if (topic.subjectId) {
            const subject = subjects.find(s => s.id === topic.subjectId);
            return subject?.name || topic.subjectId;
        }
        return "N/A";
    };

    const columns: ColumnsType<QuestionTopic> = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            sorter: true,
            sortOrder: sortField === "name" ? sortOrder : null,
            render: (name) => <span className="font-semibold text-gray-900">{name}</span>,
        },
        {
            title: "Subject",
            dataIndex: "subject",
            key: "subject",
            render: (_, record) => (
                <span className="text-gray-600">{getSubjectName(record)}</span>
            ),
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
            dataIndex: "creatAt",
            key: "creatAt",
            align: "center",
            sorter: true,
            sortOrder: sortField === "creatAt" ? sortOrder : null,
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
                            onClick={() => handleEditTopic(record)}
                        />
                    </Tooltip>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteTopic(record.id)}
                    />
                </Space>
            ),
        },
    ];

    // Calculate total from pageInfo
    const total = pageInfo?.totalElement || pageInfo?.totalElements || topics.length;

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <Card className="shadow-sm border-0">
                {/* Header Section */}
                <div className="mb-4">
                    <div className="mb-3">
                        <Title level={2} className="mb-1 text-gray-900">
                            Question Topics Management
                        </Title>
                        <p className="text-gray-600 text-sm">Manage question topics here</p>
                    </div>

                    {/* Search and Add Button */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        <Input.Search
                            placeholder="Search topics..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onSearch={handleSearch}
                            allowClear
                            className="max-w-md"
                            prefix={<SearchOutlined className="text-gray-400" />}
                            loading={loading}
                        />

                        <Select
                            placeholder="Filter by Subject"
                            allowClear
                            showSearch
                            optionFilterProp="label"
                            onChange={handleSubjectFilter}
                            className="w-full sm:w-48"
                            value={selectedSubject}
                            filterOption={(input, option) =>
                                (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {subjects.map((subject) => (
                                <Select.Option key={subject.id} value={subject.id} label={subject.name}>
                                    {subject.name}
                                </Select.Option>
                            ))}
                        </Select>

                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            className="bg-blue-600 hover:bg-blue-700 border-0 shadow-sm px-4 h-9 whitespace-nowrap"
                            onClick={handleAddTopic}
                        >
                            Add Topic
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border border-gray-200">
                    <Table
                        columns={columns}
                        dataSource={topics}
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: total,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            pageSizeOptions: ["10", "20", "50", "100"],
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} of ${total} topics`,
                            className: "px-4 py-2",
                            size: "small",
                        }}
                        onChange={handleTableChange}
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
                    title={editingTopic ? "Edit Question Topic" : "Add Question Topic"}
                    open={isModalOpen}
                    onOk={handleModalOk}
                    onCancel={() => setIsModalOpen(false)}
                    confirmLoading={saving}
                >
                    <Form form={form} layout="vertical" className="mt-4">
                        <Form.Item
                            name="name"
                            label="Topic Name"
                            rules={[{ required: true, message: "Please enter topic name" }]}
                        >
                            <Input placeholder="Enter topic name" />
                        </Form.Item>

                        <Form.Item
                            name="subjectId"
                            label="Subject"
                            rules={[{ required: true, message: "Please select a subject" }]}
                        >
                            <Select
                                placeholder="Select subject"
                                showSearch
                                optionFilterProp="label"
                                filterOption={(input, option) =>
                                    (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                                }
                            >
                                {subjects.map((subject) => (
                                    <Select.Option key={subject.id} value={subject.id}>
                                        {subject.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item name="description" label="Description">
                            <TextArea
                                placeholder="Enter topic description"
                                rows={4}
                            />
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Modal for Delete Confirmation */}
                <Modal
                    title="Delete Question Topic"
                    open={isDeleteModalOpen}
                    onOk={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                    okText="Delete"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true }}
                >
                    <p>Are you sure you want to delete this topic? This action cannot be undone.</p>
                </Modal>
            </Card>
        </div>
    );
};

export default QuestionTopicManager;
