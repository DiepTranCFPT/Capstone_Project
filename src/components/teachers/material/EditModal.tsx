import React, { useEffect } from "react";
import { Form, Input, Modal, Select, Switch, Button, InputNumber } from "antd";
import type { LearningMaterial } from "~/types/learningMaterial";
import type { MaterialType } from "~/services/materialTypeService";
import type { Subject } from "~/types/subject";

export type EditMaterialFormValues = Partial<
  Pick<LearningMaterial, "title" | "description" | "contentUrl" | "typeId" | "subjectId" | "isPublic">
> & {
  price?: number;
};

const quickPriceAmounts = [0, 50_000, 100_000, 200_000, 500_000];

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
  const price = Form.useWatch("price", form) ?? 0;

  const formatAmount = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);

  useEffect(() => {
    if (open && material) {
      const materialPrice = (material as unknown as { price?: number }).price ?? 0;
      form.setFieldsValue({
        title: material.title,
        description: material.description,
        // Use existing contentUrl or default fake URL
        contentUrl: material.contentUrl || "https://example.com/material-content",
        typeId: material.typeId,
        subjectId: material.subjectId,
        isPublic: material.isPublic,
        price: materialPrice,
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

        {/* Content URL is hidden and uses existing value or default */}
        <Form.Item name="contentUrl" hidden>
          <Input />
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

        <Form.Item label="Public" name="isPublic" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditModal;
