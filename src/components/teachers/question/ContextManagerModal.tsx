import React, { useState, useEffect, useCallback } from "react";
import {
    Modal,
    Table,
    Button,
    Space,
    Input,
    Form,
    Image,
    Select,
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    ReadOutlined,
    PictureOutlined,
    AudioOutlined,
    EyeOutlined,
    WarningOutlined,
    CheckCircleOutlined,
} from "@ant-design/icons";
import type { QuestionContext, CreateQuestionContextRequest, UpdateQuestionContextRequest } from "~/types/question";
import { useQuestionBank } from "~/hooks/useQuestionBank";
import { ContextUploader } from "./index";
import { useSubjects } from "~/hooks/useSubjects";

const { TextArea } = Input;

interface ContextManagerModalProps {
    open: boolean;
    onClose: () => void;
}

const ContextManagerModal: React.FC<ContextManagerModalProps> = ({
    open,
    onClose,
}) => {
    const {
        loading,
        fetchMyContexts,
        createQuestionContext,
        updateQuestionContext,
        fetchContextDuplicates,
    } = useQuestionBank();

    const [contexts, setContexts] = useState<QuestionContext[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingContext, setEditingContext] = useState<QuestionContext | null>(null);
    const [previewContext, setPreviewContext] = useState<QuestionContext | null>(null);
    const [duplicateContextIds, setDuplicateContextIds] = useState<Set<string>>(new Set());
    const [checkingDuplicates, setCheckingDuplicates] = useState(false);

    const { subjects, fetchSubjects } = useSubjects();

    useEffect(() => {
        fetchSubjects();
    }, [fetchSubjects]);
    // Form state
    const [form] = Form.useForm();

    // Fetch contexts on modal open
    const loadContexts = useCallback(async () => {
        const data = await fetchMyContexts({ pageSize: 100 });
        setContexts(data?.items ?? []);
    }, [fetchMyContexts]);

    useEffect(() => {
        if (open) {
            loadContexts();
        }
    }, [open, loadContexts]);

    // Handle create/edit context
    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            const contextData: CreateQuestionContextRequest | UpdateQuestionContextRequest = {
                title: values.title,
                content: values.content,
                imageUrl: values.imageUrl,
                audioUrl: values.audioUrl,
                subjectId: values.subjectId,
            };

            if (editingContext) {
                // Update existing context
                const result = await updateQuestionContext(editingContext.id, contextData);
                if (result) {
                    loadContexts();
                    handleCloseForm();
                }
            } else {
                // Create new context
                const result = await createQuestionContext(contextData as CreateQuestionContextRequest);
                if (result) {
                    loadContexts();
                    handleCloseForm();
                }
            }
        } catch (error) {
            console.error("Form validation error:", error);
        }
    };

    const handleEdit = (context: QuestionContext) => {
        setEditingContext(context);
        form.setFieldsValue({
            title: context.title,
            content: context.content,
            imageUrl: context.imageUrl,
            audioUrl: context.audioUrl,
            subjectId: context.subjectId,
        });
        setIsEditing(true);
    };

    const handleCloseForm = () => {
        setIsEditing(false);
        setEditingContext(null);
        form.resetFields();
    };

    const handleAddNew = () => {
        setEditingContext(null);
        form.resetFields();
        setIsEditing(true);
    };

    // Check for duplicate contexts
    const handleCheckDuplicates = async () => {
        setCheckingDuplicates(true);
        try {
            const duplicates = await fetchContextDuplicates();
            setDuplicateContextIds(new Set(duplicates));
        } finally {
            setCheckingDuplicates(false);
        }
    };

    const columns = [
        {
            title: "Title",
            dataIndex: "title",
            key: "title",
            ellipsis: true,
            width: 200,
            render: (title: string, record: QuestionContext) => (
                <div className="flex items-center gap-2">
                    {duplicateContextIds.has(record.id) && (
                        <WarningOutlined className="text-orange-500" title="Duplicate context" />
                    )}
                    <span className={duplicateContextIds.has(record.id) ? "text-orange-600 font-medium" : ""}>
                        {title}
                    </span>
                </div>
            ),
        },
        {
            title: "Content",
            dataIndex: "content",
            key: "content",
            ellipsis: true,
            render: (content: string) => (
                <span className="text-gray-600 text-sm">
                    {content.length > 80 ? `${content.substring(0, 80)}...` : content}
                </span>
            ),
        },
        {
            title: "Media",
            key: "media",
            width: 100,
            render: (_: unknown, record: QuestionContext) => (
                <Space>
                    {record.imageUrl && <PictureOutlined className="text-blue-500" />}
                    {record.audioUrl && <AudioOutlined className="text-green-500" />}
                    {!record.imageUrl && !record.audioUrl && (
                        <span className="text-gray-400">No media</span>
                    )}
                </Space>
            ),
        },
        {
            title: "Action",
            key: "action",
            width: 150,
            render: (_: unknown, record: QuestionContext) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => setPreviewContext(record)}
                        title="Preview"
                    />
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        title="Edit"
                    />                  
                </Space>
            ),
        },
    ];

    return (
        <>
            <Modal
                open={open}
                onCancel={onClose}
                title={
                    <div className="flex items-center gap-2">
                        <ReadOutlined className="text-[#3CBCB2] text-xl" />
                        <span className="text-xl font-semibold">Manage Question Contexts</span>
                    </div>
                }
                width={900}
                footer={null}
                styles={{
                    body: { padding: "16px", maxHeight: "70vh", overflowY: "auto" },
                }}
            >
                {!isEditing ? (
                    // List view
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-gray-600">
                                Manage reading passages, images, and audio for questions.
                            </p>
                            <Space>
                                <Button
                                    icon={duplicateContextIds.size > 0 ? <WarningOutlined /> : <CheckCircleOutlined />}
                                    onClick={handleCheckDuplicates}
                                    loading={checkingDuplicates}
                                    className={duplicateContextIds.size > 0 ? "border-orange-400 text-orange-600" : ""}
                                >
                                    {duplicateContextIds.size > 0
                                        ? `${duplicateContextIds.size} Duplicates Found`
                                        : "Check Duplicates"}
                                </Button>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={handleAddNew}
                                    style={{ backgroundColor: "#3CBCB2", border: "none" }}
                                >
                                    Add Context
                                </Button>
                            </Space>
                        </div>

                        <Table
                            dataSource={contexts}
                            columns={columns}
                            rowKey="id"
                            loading={loading}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: false,
                                showTotal: (total) => `Total ${total} contexts`,
                            }}
                            size="small"
                        />
                    </>
                ) : (
                    // Edit/Create form
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Button onClick={handleCloseForm}>← Back to List</Button>
                            <span className="text-lg font-medium">
                                {editingContext ? "Edit Context" : "Create New Context"}
                            </span>
                        </div>

                        <Form form={form} layout="vertical">
                            <Form.Item
                                name="title"
                                label="Title"
                                rules={[{ required: true, message: "Please enter context title" }]}
                            >
                                <Input
                                    placeholder="e.g., Reading Passage 1, Graph Analysis..."
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item
                                name="content"
                                label="Content"
                                rules={[{ required: true, message: "Please enter context content" }]}
                            >
                                <TextArea
                                    placeholder="Enter reading passage, description, or instructions..."
                                    rows={6}
                                    showCount
                                    maxLength={5000}
                                />
                            </Form.Item>

                            <Form.Item
                                name="subjectId"
                                label="Subject"
                                rules={[{ required: true, message: "Please select a subject" }]}
                            >
                                <Select
                                    placeholder="Select a subject"
                                    size="large"
                                    showSearch
                                    optionFilterProp="children"
                                // filterOption={(input, option) =>
                                //     option?.children.toLowerCase().includes(input.toLowerCase())
                                // }
                                >
                                    {subjects.map((subject) => (
                                        <Select.Option key={subject.id} value={subject.id}>
                                            {subject.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <div className="grid grid-cols-2 gap-4">
                                <Form.Item name="imageUrl" label="Image">
                                    <ContextUploader
                                        type="image"
                                        value={form.getFieldValue("imageUrl")}
                                        onChange={(url) => form.setFieldsValue({ imageUrl: url })}
                                    />
                                </Form.Item>

                                <Form.Item name="audioUrl" label="Audio">
                                    <ContextUploader
                                        type="audio"
                                        value={form.getFieldValue("audioUrl")}
                                        onChange={(url) => form.setFieldsValue({ audioUrl: url })}
                                    />
                                </Form.Item>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button onClick={handleCloseForm}>Cancel</Button>
                                <Button
                                    type="primary"
                                    onClick={handleSave}
                                    loading={loading}
                                    style={{ backgroundColor: "#3CBCB2", border: "none" }}
                                >
                                    {editingContext ? "Update" : "Create"}
                                </Button>
                            </div>
                        </Form>
                    </div>
                )}
            </Modal>

            {/* Preview Modal */}
            <Modal
                open={!!previewContext}
                onCancel={() => setPreviewContext(null)}
                title={previewContext?.title}
                footer={null}
                width={700}
            >
                {previewContext && (
                    <div className="space-y-4">
                        <p className="text-gray-700 whitespace-pre-wrap">
                            {previewContext.content}
                        </p>
                        {previewContext.imageUrl && (
                            <div>
                                <p className="text-sm text-gray-500 mb-2">
                                    <PictureOutlined /> Image:
                                </p>
                                <Image
                                    src={previewContext.imageUrl}
                                    alt={previewContext.title}
                                    style={{ maxHeight: "300px" }}
                                />
                            </div>
                        )}
                        {previewContext.audioUrl && (
                            <div>
                                <p className="text-sm text-gray-500 mb-2">
                                    <AudioOutlined /> Audio:
                                </p>
                                <audio src={previewContext.audioUrl} controls className="w-full" />
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </>
    );
};

export default ContextManagerModal;
