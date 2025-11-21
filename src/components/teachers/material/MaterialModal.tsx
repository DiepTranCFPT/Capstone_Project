import React, { useEffect, useState } from "react";
import { Form, Input, Modal, Select, Switch, Upload, message } from "antd";
import type { UploadFile } from "antd";
import type { Subject } from "~/types/subject";
import type { LearningMaterial } from "~/types/learningMaterial";
import type { MaterialType } from "~/services/materialTypeService";

export interface MaterialFormValues
  extends Partial<Pick<LearningMaterial, "title" | "description" | "thumbnail" | "contentUrl">> {
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
  onSubmit: (values: FormData) => Promise<void> | void;
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
  const [thumbnailList, setThumbnailList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({ isPublic: true } as Partial<MaterialFormValues>);
      setThumbnailList([]);
    }
  }, [open, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const thumbnailFile = thumbnailList[0]?.originFileObj as File | undefined;

      if (!thumbnailFile) {
        message.error("Please upload an image file.");
        return;
      }

      const formData = new FormData();
      formData.append("title", values.title ?? "");
      formData.append("description", values.description ?? "");
      formData.append("contentUrl", values.contentUrl ?? "");
      formData.append("typeId", values.typeId ?? "");
      formData.append("subjectId", values.subjectId ?? "");
      formData.append("isPublic", String(values.isPublic ?? true));
      formData.append("file", thumbnailFile);

      await onSubmit(formData);
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

        <Form.Item label="Thumbnail (Image)" required>
          <Upload
            listType="picture-card"
            fileList={thumbnailList}
            beforeUpload={() => false}
            maxCount={1}
            onChange={({ fileList }) => {
              setThumbnailList(fileList.slice(-1));
            }}
          >
            {thumbnailList.length >= 1 ? null : (
              <div>
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
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
