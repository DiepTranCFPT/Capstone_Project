import React, { useEffect } from "react";
import { Form, Input, Modal, Select, Switch } from "antd";
import type { Subject } from "~/types/subject";
import type { LearningMaterial } from "~/types/learningMaterial";
import type { MaterialType } from "~/services/materialTypeService";

export interface MaterialFormValues
  extends Partial<Pick<LearningMaterial, "title" | "description" | "contentUrl">> {
  typeId: string;
  subjectId: string;
  isPublic: boolean;
}

interface MaterialModalProps {
  open: boolean;
  loading: boolean;
  materialTypes: MaterialType[];
  subjects: Subject[];
  loadingTypes?: boolean;
  loadingSubjects?: boolean;
  onCancel: () => void;
  onSubmit: (values: MaterialFormValues) => Promise<void> | void;
}

const MaterialModal: React.FC<MaterialModalProps> = ({
  open,
  loading,
  materialTypes,
  subjects,
  loadingTypes,
  loadingSubjects,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm<MaterialFormValues>();

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({ isPublic: true } as Partial<MaterialFormValues>);
    }
  }, [open, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "errorFields" in error) {
        return;
      }
      console.error("MaterialModal submit error:", error);
    }
  };

  return (
    <Modal
      title="Add Material"
      open={open}
      onOk={handleOk}
      confirmLoading={loading}
      onCancel={onCancel}
      okText="Create"
      cancelText="Cancel"
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={{ isPublic: true }}>
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: "Please enter title" }]}
        >
          <Input placeholder="Enter title" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "Please enter description" }]}
        >
          <Input.TextArea placeholder="Enter description" rows={3} />
        </Form.Item>

        <Form.Item
          label="Content URL"
          name="contentUrl"
          rules={[
            { required: true, message: "Please enter content URL" },
            { type: "url", message: "Please enter a valid URL" },
          ]}
        >
          <Input placeholder="https://..." />
        </Form.Item>

        <Form.Item
          label="Material Type"
          name="typeId"
          rules={[{ required: true, message: "Please select material type" }]}
        >
          <Select
            placeholder="Select material type"
            loading={loadingTypes}
            showSearch
            optionFilterProp="label"
            filterOption={(input, option) =>
              String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={materialTypes.map((type) => ({
              label: type.name,
              value: type.id,
            }))}
          />
        </Form.Item>

        <Form.Item
          label="Subject"
          name="subjectId"
          rules={[{ required: true, message: "Please select subject" }]}
        >
          <Select
            placeholder="Select subject"
            loading={loadingSubjects}
            showSearch
            optionFilterProp="label"
            filterOption={(input, option) =>
              String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
          >
            {subjects.map((subject) => (
              <Select.Option key={subject.id} value={subject.id} label={subject.name}>
                {subject.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Public" name="isPublic" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MaterialModal;
