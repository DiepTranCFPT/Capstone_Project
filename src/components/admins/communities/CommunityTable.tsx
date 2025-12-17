import React from "react";
import { Table, Button, Tooltip, Space } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Community } from "~/types/community";

interface CommunityTableProps {
  dataSource: Community[];
  loading: boolean;
  onEdit: (record: Community) => void;
  onDelete: (id: string | number) => void;
}

const CommunityTable: React.FC<CommunityTableProps> = ({
  dataSource,
  loading,
  onEdit,
  onDelete,
}) => {
  // Helper function để normalize text và loại bỏ duplicate
  const normalizeText = (text: string): string => {
    if (!text || typeof text !== "string") return "";
    const parts = text.split(/,\s*/).map(s => s.trim()).filter(s => s);
    return Array.from(new Set(parts)).join(", ");
  };

  const columns: ColumnsType<Community> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: unknown) => {
        const nameStr = typeof name === "string" ? name : String(name || "");
        const uniqueName = normalizeText(nameStr);
        return <span className="font-semibold text-gray-900">{uniqueName}</span>;
      },
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (description: unknown) => {
        const descStr = typeof description === "string" ? description : String(description || "");
        const uniqueDesc = normalizeText(descStr);
        return (
          <span className="text-gray-600">
            {uniqueDesc || "No description"}
          </span>
        );
      },
    },
    {
      title: "Members",
      dataIndex: "memberCount",
      key: "memberCount",
      render: (count) => (
        <span className="text-gray-600">{count ?? 0} members</span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_: unknown, record: Community) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              className="text-blue-500 hover:bg-blue-50"
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              onClick={() => onDelete(record.id)}
              className="text-red-500 hover:bg-red-50"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <Table
        rowKey="id"
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `${total} communities`,
        }}
        rowClassName="hover:bg-gray-50 transition-colors duration-200"
        className="overflow-x-auto"
        scroll={{ x: 800 }}
        size="middle"
      />
    </div>
  );
};

export default CommunityTable;

