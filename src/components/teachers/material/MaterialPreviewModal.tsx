import React from "react";
import { Modal, Tag, Descriptions, Typography, Button } from "antd";
import type { LearningMaterial } from "~/types/learningMaterial";

interface MaterialPreviewModalProps {
  material: LearningMaterial | null;
  open: boolean;
  onClose: () => void;
}

const MaterialPreviewModal: React.FC<MaterialPreviewModalProps> = ({ material, open, onClose }) => {
  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return "N/A";
    if (price === 0) return "Free";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const materialPrice = material ? (material as unknown as { price?: number }).price : undefined;

  return (
    <Modal
      title={material ? `Material • ${material.title}` : "Material Detail"}
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
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
            <Descriptions.Item label="Price">
              <span className={materialPrice === 0 ? "text-green-600 font-semibold" : "font-semibold"}>
                {formatPrice(materialPrice)}
              </span>
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

