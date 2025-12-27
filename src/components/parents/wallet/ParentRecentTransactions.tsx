import React from "react";
import { Card, Tag } from "antd";
import { CheckCircleTwoTone, MinusCircleTwoTone } from "@ant-design/icons";

export interface ParentTransactionItem {
  id: number | string;
  title: string;
  date: string;
  amount: number;
  to?: string;
  type?: "in" | "out";
  status?: string;
  balanceAfter?: number;
}

interface ParentRecentTransactionsProps {
  transactions: ParentTransactionItem[];
  loading?: boolean;
  onViewAll?: () => void;
}

const ParentRecentTransactions: React.FC<ParentRecentTransactionsProps> = ({ 
  transactions, 
  loading,
  onViewAll 
}) => {
  return (
    <Card
      title={<span className="font-semibold text-gray-800">Recent transactions</span>}
      extra={
        <a 
          href="#" 
          className="text-indigo-600 font-semibold"
          onClick={(e) => {
            e.preventDefault();
            onViewAll?.();
          }}
        >
          View all
        </a>
      }
      className="shadow-md border border-gray-100"
      headStyle={{ background: "#f8fafc" }}
    >
      <div className="space-y-3">
        {loading && <p className="text-sm text-gray-500">Loading transactions...</p>}
        {!loading && transactions.length === 0 && (
          <p className="text-sm text-gray-500">No transactions.</p>
        )}
        {transactions.map((tx) => {
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
                <div className={`p-2 rounded-full ${isIncome ? "bg-emerald-50" : "bg-red-50"}`}>
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
                  {typeof tx.balanceAfter === "number" && (
                    <p className="text-xs text-gray-400 mt-1">
                      Balance after: {tx.balanceAfter.toLocaleString("vi-VN")} đ
                    </p>
                  )}
                </div>
              </div>
              <div className={`font-bold ${isIncome ? "text-emerald-600" : "text-red-500"}`}>
                {isIncome ? "+" : "-"}
                {Math.abs(tx.amount).toLocaleString("vi-VN")} đ
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default ParentRecentTransactions;

