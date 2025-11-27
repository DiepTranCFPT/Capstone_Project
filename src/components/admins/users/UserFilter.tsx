import React from "react";
import { Select, Button } from "antd";
import { FilterOutlined } from "@ant-design/icons";

interface UserFilterProps {
  keyword: string;
  role?: string;
  isVerified?: boolean;
  isLocked?: boolean;
  setKeyword: (value: string) => void;
  setRole: (value: string | undefined) => void;
  setIsVerified: (value: boolean | undefined) => void;
  setIsLocked: (value: boolean | undefined) => void;
  onRefresh: () => void;
  total: number;
}

const UserFilter: React.FC<UserFilterProps> = ({
  keyword,
  role,
  isVerified,
  isLocked,
  setKeyword,
  setRole,
  setIsVerified,
  setIsLocked,
  onRefresh,
  total,
}) => {
  const hasFilters = role || isVerified !== undefined || isLocked !== undefined || keyword;

  return (
    <div className="flex flex-wrap gap-3 mb-4 items-center">
      <div className="flex items-center gap-2">
        <FilterOutlined className="text-gray-400" />
        <span className="text-sm text-gray-600">Lọc theo:</span>
      </div>

      {/* Role Filter */}
      <Select
        placeholder="Vai trò"
        value={role}
        onChange={(val) => setRole(val === "all" ? undefined : val)}
        className="min-w-32"
        allowClear
        onClear={() => setRole(undefined)}
        options={[
          { label: "Tất cả vai trò", value: "all" },
          { label: "Admin", value: "ADMIN" },
          { label: "Teacher", value: "TEACHER" },
          { label: "Student", value: "STUDENT" },
          { label: "Parent", value: "PARENT" },
        ]}
      />

      {/* Verified Filter */}
      <Select
        placeholder="Xác thực"
        value={isVerified === undefined ? "all" : isVerified}
        onChange={(val: string | boolean) => setIsVerified(val === "all" ? undefined : (val as boolean))}
        className="min-w-36"
        options={[
          { label: "Tất cả xác thực", value: "all" },
          { label: "Đã xác thực", value: true },
          { label: "Chưa xác thực", value: false },
        ]}
      />

      {/* Locked Filter */}
      <Select
        placeholder="Trạng thái khóa"
        value={isLocked === undefined ? "all" : isLocked}
        onChange={(val: string | boolean) => setIsLocked(val === "all" ? undefined : (val as boolean))}
        className="min-w-36"
        options={[
          { label: "Tất cả trạng thái", value: "all" },
          { label: "Đã khóa", value: true },
          { label: "Hoạt động", value: false },
        ]}
      />

      {/* Clear Filters Button */}
      {hasFilters && (
        <Button
          type="text"
          size="small"
          onClick={() => {
            setRole(undefined);
            setIsVerified(undefined);
            setIsLocked(undefined);
            setKeyword("");
            onRefresh();
          }}
          className="text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          Xóa bộ lọc
        </Button>
      )}

      {/* Total Count */}
      <div className="ml-auto text-sm text-gray-500">
        Tổng số: {total} người dùng
      </div>
    </div>
  );
};

export default UserFilter;
