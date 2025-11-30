import React, { useState, useEffect } from "react";
import { Table, Button, Tag, Input, Space, Tooltip, Select } from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { TokenData } from "~/types/token";
import { message } from "antd";

interface TokenPackagesTabProps {
  tokenData: TokenData[];
  setTokenData: React.Dispatch<React.SetStateAction<TokenData[]>>;
  onAddToken: () => void;
  onEditToken: (record: TokenData) => void;
}

const TokenPackagesTab: React.FC<TokenPackagesTabProps> = ({
  tokenData,
  setTokenData,
  onAddToken,
  onEditToken,
}) => {
  const [filteredTokenData, setFilteredTokenData] = useState(tokenData);
  const [searchTokenText, setSearchTokenText] = useState("");
  const [statusTokenFilter, setStatusTokenFilter] = useState<string>("all");

  // Sync filtered data when tokenData changes
  useEffect(() => {
    applyTokenFilters(searchTokenText, statusTokenFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenData]);

  const handleTokenSearch = (value: string) => {
    setSearchTokenText(value);
    applyTokenFilters(value, statusTokenFilter);
  };

  const handleTokenStatusFilter = (value: string) => {
    setStatusTokenFilter(value);
    applyTokenFilters(searchTokenText, value);
  };

  const applyTokenFilters = (search: string, status: string) => {
    const filtered = tokenData.filter(token => {
      const matchesSearch = token.tokenAmount.toString().includes(search.toLowerCase()) ||
                           token.price.toString().includes(search.toLowerCase());
      const matchesStatus = status === "all" || token.status === status;
      return matchesSearch && matchesStatus;
    });
    setFilteredTokenData(filtered);
  };

  const handleDeleteToken = (record: TokenData) => {
    message.success(`${record.tokenAmount} tokens deleted successfully`);
    setTokenData(prev => prev.filter(token => token.id !== record.id));
  };

  const tokenColumns: ColumnsType<TokenData> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 120,
    },
    {
      title: "Token Amount",
      dataIndex: "tokenAmount",
      key: "tokenAmount",
      width: 150,
      render: (amount) => <span className="font-semibold text-blue-600">{amount} tokens</span>,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      width: 120,
      render: (price) => <span className="font-bold text-green-600">${price}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => (
        <Tag color={status === "Active" ? "success" : "error"}>{status}</Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 150,
      align: "center",
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => onEditToken(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteToken(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      {/* Token Header */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <Input.Search
            placeholder="Search tokens..."
            value={searchTokenText}
            onChange={(e) => setSearchTokenText(e.target.value)}
            onSearch={handleTokenSearch}
            allowClear
            className="max-w-md"
            prefix={<SearchOutlined className="text-gray-400" />}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-blue-600 hover:bg-blue-700 border-0 shadow-sm px-4 h-9 whitespace-nowrap"
            onClick={onAddToken}
          >
            Add Token Package
          </Button>
        </div>
      </div>

      {/* Token Filter */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2">
          <FilterOutlined className="text-gray-400" />
          <span className="text-sm text-gray-600">Filter by:</span>
        </div>
        <Select
          placeholder="Status"
          value={statusTokenFilter}
          onChange={handleTokenStatusFilter}
          className="min-w-32"
          options={[
            { label: "All Status", value: "all" },
            { label: "Active", value: "Active" },
            { label: "Inactive", value: "Inactive" }
          ]}
        />
        {(statusTokenFilter !== "all" || searchTokenText) && (
          <Button
            type="text"
            size="small"
            onClick={() => {
              setSearchTokenText("");
              setStatusTokenFilter("all");
              setFilteredTokenData(tokenData);
            }}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Token Table */}
      <Table
        columns={tokenColumns}
        dataSource={filteredTokenData}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} token packages`,
        }}
        rowClassName="hover:bg-gray-50 transition-colors duration-200"
        className="bg-white rounded-lg border border-gray-200 overflow-x-auto"
        scroll={{ x: 700 }}
      />
    </>
  );
};

export default TokenPackagesTab;

