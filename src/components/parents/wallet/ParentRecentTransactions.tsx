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
}

interface ParentRecentTransactionsProps {
  transactions: ParentTransactionItem[];
}

const ParentRecentTransactions: React.FC<ParentRecentTransactionsProps> = ({ transactions }) => {
  return (
    <Card
      title={<span className="font-semibold text-gray-800">Recent transactions</span>}
      extra={<a href="#" className="text-indigo-600 font-semibold">View all</a>}
      className="shadow-md border border-gray-100"
      headStyle={{ background: "#f8fafc" }}
    >
      <div className="space-y-3">
        {transactions.map((tx) => {
          const isIncome = tx.amount > 0;
          const Icon = isIncome ? CheckCircleTwoTone : MinusCircleTwoTone;
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
                  {tx.to && (
                    <Tag color="blue" className="mt-1">
                      To: {tx.to}
                    </Tag>
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

