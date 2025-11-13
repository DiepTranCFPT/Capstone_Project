import React, { useEffect } from "react";
import { Form, Input, Modal } from "antd";
import type { LearningMaterial } from "~/types/learningMaterial";

export interface LessonFormValues {
    name: string;
    file?: string;
    url?: string;
    questionId?: string;
    learningMaterialId: string;
}

interface LessonModalProps {
    open: boolean;
    loading: boolean;
    material: LearningMaterial | null;
    onCancel: () => void;
    onSubmit: (values: LessonFormValues) => Promise<void> | void;
}

const LessonModal: React.FC<LessonModalProps> = ({
    open,
    loading,
    material,
    onCancel,
    onSubmit,
}) => {
    const [form] = Form.useForm<LessonFormValues>();

    useEffect(() => {
        if (open) {
            form.resetFields();
            form.setFieldsValue({
                learningMaterialId: material?.id ?? "",
            });
        }
    }, [open, material, form]);

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            await onSubmit(values);
        } catch (error: unknown) {
            if (typeof error === "object" && error !== null && "errorFields" in error) {
                return;
            }
            console.error("LessonModal submit error:", error);
        }
    };

    return (
        <Modal
            title={material ? `Add Lesson • ${material.title}` : "Add Lesson"}
            open={open}
            onOk={handleOk}
            confirmLoading={loading}
            onCancel={onCancel}
            okText="Create"
            cancelText="Cancel"
            destroyOnClose
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    label="Name"
                    name="name"
                    rules={[{ required: true, message: "Please enter lesson name" }]}
                >
                    <Input placeholder="Enter lesson name" />
                </Form.Item>

                <Form.Item label="File" name="file">
                    <Input placeholder="Enter file path or identifier" />
                </Form.Item>

                <Form.Item
                    label="URL"
                    name="url"
                    rules={[{ type: "url", message: "Please enter a valid URL" }]}
                >
                    <Input placeholder="https://..." />
                </Form.Item>


                <Form.Item
                    label="Learning Material ID"
                    name="learningMaterialId"
                    rules={[{ required: true, message: "Missing learning material" }]}
                >
                    <Input disabled />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default LessonModal;
