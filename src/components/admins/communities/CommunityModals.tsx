import React, { useState } from "react";
import { Modal, Form, Input, Button, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { Community } from "~/types/community";
import CommunityService from "~/services/communityService";

const { TextArea } = Input;

interface EditModalProps {
  open: boolean;
  community: Community | null;
  onCancel: () => void;
  onSuccess: () => void;
}

export const EditCommunityModal: React.FC<EditModalProps> = ({
  open,
  community,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (community && open) {
      form.setFieldsValue({
        name: community.name,
        description: community.description,
      });
    }
  }, [community, open, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (!community) return;

      setLoading(true);
      const payload: { name?: string; description?: string } = {};
      if (values.name) {
        payload.name = values.name;
      }
      if (values.description !== undefined) {
        payload.description = values.description;
      }

      await CommunityService.updateCommunity(community.id, payload);
      
      // Callback để parent component cập nhật state
      onSuccess();

      message.success("Community updated successfully");
      form.resetFields();
      onCancel();
    } catch (error) {
      console.error("Failed to save community:", error);
      message.error("Failed to save community");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Edit Community"
      open={open}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      okText="Save"
      cancelText="Cancel"
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: "Please enter community name" }]}
        >
          <Input placeholder="Community name" />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <TextArea rows={4} placeholder="Community description" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

interface CreateModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export const CreateCommunityModal: React.FC<CreateModalProps> = ({
  open,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      await CommunityService.createCommunity({
        name: values.name,
        description: values.description,
        subjectId: values.subjectId,
        image: imageFile || undefined,
      });

      message.success("Community created successfully");
      form.resetFields();
      setImageFile(null);
      onSuccess();
      onCancel();
    } catch (error) {
      message.error("Failed to create community");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Create Community"
      open={open}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields();
        setImageFile(null);
        onCancel();
      }}
      okText="Create"
      cancelText="Cancel"
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: "Please enter community name" }]}
        >
          <Input placeholder="Community name" />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: "Please enter community description" }]}
        >
          <TextArea rows={4} placeholder="Community description" />
        </Form.Item>
        <Form.Item name="subjectId" label="Subject ID (Optional)">
          <Input placeholder="Subject ID" />
        </Form.Item>
        <Form.Item label="Image">
          <Upload
            beforeUpload={(file) => {
              setImageFile(file);
              return false;
            }}
            onRemove={() => {
              setImageFile(null);
            }}
            maxCount={1}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />}>Select Image</Button>
          </Upload>
          {imageFile && (
            <p className="text-sm text-gray-500 mt-2">{imageFile.name}</p>
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
};

interface DeleteModalProps {
  open: boolean;
  communityId: string | number | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export const DeleteCommunityModal: React.FC<DeleteModalProps> = ({
  open,
  communityId,
  onCancel,
  onConfirm,
}) => {
  const handleConfirm = async () => {
    if (!communityId) return;
    try {
      // TODO: Implement delete community API if available
      message.warning("Delete community feature is not yet implemented in the API");
      onConfirm();
    } catch (error) {
      message.error("Failed to delete community");
      console.error(error);
    }
  };

  return (
    <Modal
      title="Delete Community"
      open={open}
      onOk={handleConfirm}
      onCancel={onCancel}
      okText="Delete"
      cancelText="Cancel"
      okType="danger"
    >
      <p>Are you sure you want to delete this community? This action cannot be undone.</p>
    </Modal>
  );
};

