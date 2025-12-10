import React from "react";
import { Modal, Form, InputNumber, Button, Input } from "antd";

interface TopUpModalProps {
  open: boolean;
  loading: boolean;
  amount: number;
  note: string;
  quickAmounts: number[];
  onAmountChange: (value: number) => void;
  onNoteChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

const TopUpModal: React.FC<TopUpModalProps> = ({
  open,
  loading,
  amount,
  note,
  quickAmounts,
  onAmountChange,
  onNoteChange,
  onCancel,
  onSubmit,
}) => {
  return (
    <Modal
      title="Top up wallet"
      open={open}
      onCancel={onCancel}
      onOk={onSubmit}
      okText="Create payment"
      confirmLoading={loading}
    >
      <Form layout="vertical">
        <Form.Item label="Amount (VND)">
          <InputNumber
            className="w-full"
            min={1000}
            step={50000}
            value={amount}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            parser={(value) => Number((value || "0").replace(/,/g, ""))}
            onChange={(val) => onAmountChange(Number(val))}
          />
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-2">Quick amounts</p>
            <div className="flex flex-wrap gap-2">
              {quickAmounts.map((val) => {
                const active = val === amount;
                return (
                  <Button
                    key={val}
                    type={active ? "primary" : "default"}
                    ghost={false}
                    size="middle"
                    onClick={() => onAmountChange(val)}
                  >
                    {val.toLocaleString("vi-VN")} đ
                  </Button>
                );
              })}
            </div>
          </div>
        </Form.Item>
        <Form.Item label="Note">
          <Input
            placeholder="Top up parent wallet"
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TopUpModal;

