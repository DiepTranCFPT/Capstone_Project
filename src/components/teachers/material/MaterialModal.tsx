import React, { useEffect, useState, useMemo } from "react";
import { Form, Input, Modal, Select, Switch, Upload, message, Button, InputNumber } from "antd";
import type { UploadFile } from "antd";
import type { Subject } from "~/types/subject";
import type { LearningMaterial } from "~/types/learningMaterial";
import type { MaterialType } from "~/services/materialTypeService";

export interface MaterialFormValues
  extends Partial<Pick<LearningMaterial, "title" | "description" | "thumbnail" | "contentUrl">> {
  typeId: string;
  subjectId: string;
  isPublic: boolean;
  price?: number;
}

// Các mức giá chọn nhanh (không bao gồm Free để tránh hiển thị nút "Free")
const quickPriceAmounts = [50_000, 100_000, 200_000, 500_000];

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
  const price = Form.useWatch("price", form) ?? 0;
  const selectedTypeId = Form.useWatch("typeId", form);
  
  // Check if selected material type is "token"
  const isTokenType = useMemo(() => {
    if (!selectedTypeId) return false;
    const selectedType = materialTypes.find((type) => type.id === selectedTypeId);
    return selectedType?.name?.toLowerCase().includes("token") ?? false;
  }, [selectedTypeId, materialTypes]);

  const formatAmount = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldsValue({ 
        isPublic: true,
        contentUrl: "https://example.com/material-content", // Default fake URL
        price: 0
      } as Partial<MaterialFormValues>);
      setThumbnailList([]);
    }
  }, [open, form]);

  // Reset price to 0 when material type changes to non-token
  useEffect(() => {
    if (!isTokenType && selectedTypeId) {
      form.setFieldsValue({ price: 0 });
    }
  }, [isTokenType, selectedTypeId, form]);

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
      // Use default fake URL if not provided
      formData.append("contentUrl", values.contentUrl ?? "https://example.com/material-content");
      formData.append("typeId", values.typeId ?? "");
      formData.append("subjectId", values.subjectId ?? "");
      formData.append("isPublic", String(values.isPublic ?? true));
      // Set price to 0 if not token type
      const finalPrice = isTokenType ? (values.price ?? 0) : 0;
      formData.append("price", String(finalPrice));
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
      <Form 
        form={form} 
        layout="vertical" 
        initialValues={{ 
          isPublic: true,
          contentUrl: "https://example.com/material-content", // Default fake URL
          price: 0
        }}
      >
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

        {/* Content URL is hidden and set to default value */}
        <Form.Item name="contentUrl" hidden>
          <Input />
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

        {isTokenType && (
          <Form.Item
            label="Price (VND)"
            name="price"
            rules={[
              { required: true, message: "Please enter price" },
              { type: "number", min: 0, message: "Price must be greater than or equal to 0" },
            ]}
          >
            <div className="space-y-3">
              <div className="flex gap-3 items-center">
                <InputNumber
                  min={0}
                  value={price}
                  onChange={(value) => form.setFieldsValue({ price: value ?? 0 })}
                  placeholder="Enter price (VND)"
                  className="flex-1"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={(value) => value?.replace(/\$\s?|(,*)/g, "") as unknown as number}
                />
                <div className="min-w-[140px] rounded-lg border border-slate-200 bg-white px-4 py-2 text-lg font-bold text-slate-900">
                  {formatAmount(price)}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {quickPriceAmounts.map((amount) => (
                  <Button
                    key={amount}
                    type={price === amount ? "primary" : "default"}
                    onClick={() => form.setFieldsValue({ price: amount })}
                    className={
                      price === amount
                        ? "border-teal-400 bg-teal-50 text-teal-600"
                        : "border-slate-200 text-slate-500 hover:border-teal-200 hover:text-teal-500"
                    }
                  >
                    {amount === 0 ? "Free" : formatAmount(amount)}
                  </Button>
                ))}
              </div>
            </div>
          </Form.Item>
        )}

        <Form.Item label="Public" name="isPublic" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MaterialModal;
