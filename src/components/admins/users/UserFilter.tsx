import React from "react";
import { Select, Button } from "antd";
import { FilterOutlined } from "@ant-design/icons";

interface UserFilterProps {
  roleFilter: string;
  statusFilter: string;
  search: string;
  setRoleFilter: (value: string) => void;
  setStatusFilter: (value: string) => void;
  setSearch: (value: string) => void;
  uniqueRoles: string[];
  total: number;
  filteredCount: number;
}

const UserFilter: React.FC<UserFilterProps> = ({
  roleFilter,
  statusFilter,
  search,
  setRoleFilter,
  setStatusFilter,
  setSearch,
  uniqueRoles,
  total,
  filteredCount,
}) => {
  return (
    <div className="flex flex-wrap gap-3 mb-4">
      <div className="flex items-center gap-2">
        <FilterOutlined className="text-gray-400" />
        <span className="text-sm text-gray-600">Lọc theo:</span>
      </div>

      {/* Lọc theo vai trò */}
      <Select
        placeholder="Vai trò"
        value={roleFilter}
        onChange={setRoleFilter}
        className="min-w-32"
        options={[
          { label: "Tất cả vai trò", value: "all" },
          ...uniqueRoles.map((r) => ({ label: r, value: r })),
        ]}
      />

      {/* Lọc theo trạng thái */}
      <Select
        placeholder="Trạng thái"
        value={statusFilter}
        onChange={setStatusFilter}
        className="min-w-36"
        options={[
          { label: "Tất cả trạng thái", value: "all" },
          { label: "Hoạt động", value: "active" },
          { label: "Ngưng hoạt động", value: "inactive" },
        ]}
      />

      {/* Nút xoá bộ lọc */}
      {(roleFilter !== "all" || statusFilter !== "all" || search) && (
        <Button
          type="text"
          size="small"
          onClick={() => {
            setRoleFilter("all");
            setStatusFilter("all");
            setSearch("");
          }}
          className="text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          Xóa bộ lọc
        </Button>
      )}

      {/* Số lượng hiển thị */}
      <div className="ml-auto text-sm text-gray-500">
        Hiển thị {filteredCount} / {total} người dùng
      </div>
    </div>
  );
};

export default UserFilter;
