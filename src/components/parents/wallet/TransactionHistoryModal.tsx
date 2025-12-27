import React from "react";
import { Modal, Tag } from "antd";
import { CheckCircleTwoTone, MinusCircleTwoTone } from "@ant-design/icons";
import type { ParentTransactionItem } from "./ParentRecentTransactions";

interface TransactionHistoryModalProps {
  open: boolean;
  onCancel: () => void;
  transactions: ParentTransactionItem[];
}

const TransactionHistoryModal: React.FC<TransactionHistoryModalProps> = ({
  open,
  onCancel,
  transactions,
}) => {
  return (
    <Modal
      title="Transaction History"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
      centered
      className="transaction-history-modal"
    >
      <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-3 mt-4">
        {transactions.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No transactions found.</p>
        ) : (
          transactions.map((tx) => {
            const isIncome = tx.amount > 0;
            const Icon = isIncome ? CheckCircleTwoTone : MinusCircleTwoTone;
            const statusUpper = (tx.status || "").toUpperCase();
            const statusColor = statusUpper.includes("SUCCESS")
              ? "green"
              : statusUpper.includes("PENDING")
              ? "orange"
              : "red";

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-xl px-3 py-3 border border-gray-100 bg-white hover:shadow-sm transition"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full ${
                      isIncome ? "bg-emerald-50" : "bg-red-50"
                    }`}
                  >
                    <Icon twoToneColor={isIncome ? "#16a34a" : "#ef4444"} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{tx.title}</p>
                    <p className="text-xs text-gray-500">{tx.date}</p>
                    {tx.status && (
                      <Tag color={statusColor} className="mt-1">
                        {statusUpper || "STATUS"}
                      </Tag>
                    )}
                    {tx.to && (
                      <Tag color="blue" className="mt-1">
                        To: {tx.to}
                      </Tag>
                    )}
                    {/* Only show balanceAfter if it's a number (can be 0) */}
                    {typeof tx.balanceAfter === "number" && (
                      <p className="text-xs text-gray-400 mt-1">
                        Balance after: {tx.balanceAfter.toLocaleString("vi-VN")} đ
                      </p>
                    )}
                  </div>
                </div>
                <div
                  className={`font-bold ${
                    isIncome ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {isIncome ? "+" : "-"}
                  {Math.abs(tx.amount).toLocaleString("vi-VN")} đ
                </div>
              </div>
            );
          })
        )}
      </div>
    </Modal>
  );
};

export default TransactionHistoryModal;
