import React from "react";
import { Card } from "antd";
import type { ChildInfo } from "~/types/parent";

interface ParentChildrenAccountsProps {
  childrenAccounts: ChildInfo[];
  loading: boolean;
}

const ParentChildrenAccounts: React.FC<ParentChildrenAccountsProps> = ({
  childrenAccounts,
  loading,
}) => {
  return (
    <Card
      title={<span className="font-semibold text-gray-800">Children accounts</span>}
      className="shadow-md border border-gray-100"
      headStyle={{ background: "#f8fafc" }}
    >
      <div className="space-y-4">
        {loading ? (
          <p className="text-sm text-gray-500">Loading children...</p>
        ) : childrenAccounts.length === 0 ? (
          <p className="text-sm text-gray-500">No linked children.</p>
        ) : (
          childrenAccounts.map((child) => (
            <div
              key={child.studentId}
              className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-3 border border-gray-100"
            >
              <div className="flex flex-col">
                <p className="font-semibold text-gray-800">{child.studentName}</p>
                <p className="text-xs text-gray-500">Savings</p>
              </div>
              <span className="font-semibold text-indigo-700">
                {(0).toLocaleString("vi-VN")} đ
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default ParentChildrenAccounts;

