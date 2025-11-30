import React from "react";
import { Modal, Form, InputNumber } from "antd";
import type { FormInstance } from "antd/es/form";
import type { TokenData } from "~/types/token";

interface TokenPackageModalProps {
  open: boolean;
  editingToken: TokenData | null;
  form: FormInstance;
  onOk: () => void;
  onCancel: () => void;
}

const TokenPackageModal: React.FC<TokenPackageModalProps> = ({
  open,
  editingToken,
  form,
  onOk,
  onCancel,
}) => {
  return (
    <Modal
      title={editingToken ? "Edit Token Package" : "Add Token Package"}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="tokenAmount"
          label="Token Amount"
          rules={[{ required: true, message: "Please enter token amount" }]}
        >
          <InputNumber
            min={1}
            className="w-full"
            placeholder="Enter token amount (99, 199, 499, 999)"
          />
        </Form.Item>
        <Form.Item
          name="price"
          label="Price (USD)"
          rules={[{ required: true, message: "Please enter price" }]}
        >
          <InputNumber
            min={0.01}
            step={0.01}
            className="w-full"
            placeholder="Enter price in USD"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TokenPackageModal;

