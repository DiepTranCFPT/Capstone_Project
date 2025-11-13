import React, { useEffect } from "react";
import { Form, Input, Modal, Select, Switch } from "antd";
import type { LearningMaterial } from "~/types/learningMaterial";
import type { MaterialType } from "~/services/materialTypeService";
import type { Subject } from "~/types/subject";

export type EditMaterialFormValues = Partial<
  Pick<LearningMaterial, "title" | "description" | "contentUrl" | "typeId" | "subjectId" | "isPublic">
>;

interface EditModalProps {
  open: boolean;
  loading: boolean;
  material: LearningMaterial | null;
  materialTypes: MaterialType[];
  subjects: Subject[];
  loadingTypes?: boolean;
  loadingSubjects?: boolean;
  onCancel: () => void;
  onSubmit: (values: EditMaterialFormValues) => Promise<void> | void;
}

const EditModal: React.FC<EditModalProps> = ({
  open,
  loading,
  material,
  materialTypes,
  subjects,
  loadingTypes,
  loadingSubjects,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm<EditMaterialFormValues>();

  useEffect(() => {
    if (open && material) {
      form.setFieldsValue({
        title: material.title,
        description: material.description,
        contentUrl: material.contentUrl,
        typeId: material.typeId,
        subjectId: material.subjectId,
        isPublic: material.isPublic,
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
      console.error("EditModal submit error:", error);
    }
  };

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [open, form]);

  return (
    <Modal
      title={material ? `Edit Material • ${material.title}` : "Edit Material"}
      open={open}
      onOk={handleOk}
      confirmLoading={loading}
      onCancel={onCancel}
      okText="Save"
      cancelText="Cancel"
      destroyOnClose
    >
      <Form form={form} layout="vertical">
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

export default EditModal;
