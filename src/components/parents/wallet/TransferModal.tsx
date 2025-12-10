import React from "react";
import { Modal, Form, InputNumber, Button, Input, Select } from "antd";
import type { ChildInfo } from "~/types/parent";

interface TransferModalProps {
  open: boolean;
  loading: boolean;
  childrenAccounts: ChildInfo[];
  childrenLoading: boolean;
  selectedChildId?: string;
  amount: number;
  note: string;
  quickAmounts: number[];
  onSelectChild: (value: string) => void;
  onAmountChange: (value: number) => void;
  onNoteChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

const TransferModal: React.FC<TransferModalProps> = ({
  open,
  loading,
  childrenAccounts,
  childrenLoading,
  selectedChildId,
  amount,
  note,
  quickAmounts,
  onSelectChild,
  onAmountChange,
  onNoteChange,
  onCancel,
  onSubmit,
}) => {
  return (
    <Modal
      title="Transfer to child"
      open={open}
      onCancel={onCancel}
      onOk={onSubmit}
      okText="Transfer"
      confirmLoading={loading}
    >
      <Form layout="vertical">
        <Form.Item label="Child">
          <Select
            loading={childrenLoading}
            value={selectedChildId}
            onChange={onSelectChild}
            placeholder="Select child"
            options={childrenAccounts.map((c) => ({
              value: c.studentId,
              label: c.studentName,
            }))}
          />
        </Form.Item>
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
            placeholder="Transfer to child"
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TransferModal;

