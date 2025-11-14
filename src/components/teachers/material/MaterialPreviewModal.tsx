import React from "react";
import { Modal, Tag, Descriptions, Typography, Button } from "antd";
import type { LearningMaterial } from "~/types/learningMaterial";

interface MaterialPreviewModalProps {
  material: LearningMaterial | null;
  open: boolean;
  onClose: () => void;
}

const MaterialPreviewModal: React.FC<MaterialPreviewModalProps> = ({ material, open, onClose }) => {
  return (
    <Modal
      title={material ? `Material • ${material.title}` : "Material Detail"}
      open={open}
      onCancel={onClose}
      footer={[
        material?.contentUrl ? (
          <Button key="open" type="primary" href={material.contentUrl} target="_blank">
            Open Content
          </Button>
        ) : null,
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ].filter(Boolean)}
      width={720}
      destroyOnClose
    >
      {material ? (
        <div className="space-y-4">
          <div>
            <Typography.Title level={4} className="!mb-1">
              {material.title}
            </Typography.Title>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{material.authorName}</span>
              <span>•</span>
              <span>{new Date(material.createdAt).toLocaleDateString()}</span>
            </div>
            <Tag color={material.isPublic ? "green" : "red"} className="mt-2">
              {material.isPublic ? "Public" : "Private"}
            </Tag>
          </div>

          <Typography.Paragraph>{material.description}</Typography.Paragraph>

          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Type">{material.typeName}</Descriptions.Item>
            <Descriptions.Item label="Subject">{material.subjectName}</Descriptions.Item>
            <Descriptions.Item label="Content URL">
              <Typography.Link href={material.contentUrl} target="_blank">
                {material.contentUrl}
              </Typography.Link>
            </Descriptions.Item>
            <Descriptions.Item label="Created At">
              {new Date(material.createdAt).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Updated At">
              {new Date(material.updatedAt).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        </div>
      ) : (
        <Typography.Text type="secondary">No material selected.</Typography.Text>
      )}
    </Modal>
  );
};

export default MaterialPreviewModal;

