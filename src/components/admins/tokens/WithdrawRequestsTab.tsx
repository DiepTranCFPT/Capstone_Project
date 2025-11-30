import React, { useState, useEffect } from "react";
import { Table, Button, Tag, Input, Select } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { WithdrawRequest } from "~/types/tokenTransaction";
import { useTokenTransaction } from "~/hooks/useTokenTransaction";

const WithdrawRequestsTab: React.FC = () => {
  const { withdrawRequests, loading: withdrawLoading, fetchWithdrawRequests } = useTokenTransaction();
  const [searchWithdrawText, setSearchWithdrawText] = useState("");
  const [statusWithdrawFilter, setStatusWithdrawFilter] = useState<string>("all");
  const [filteredWithdrawRequests, setFilteredWithdrawRequests] = useState<WithdrawRequest[]>([]);

  // Fetch withdraw requests on mount
  useEffect(() => {
    fetchWithdrawRequests({ pageNo: 0, pageSize: 100 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter withdraw requests
  useEffect(() => {
    let filtered = withdrawRequests;
    
    if (searchWithdrawText) {
      filtered = filtered.filter(request =>
        request.id?.toLowerCase().includes(searchWithdrawText.toLowerCase()) ||
        request.bankAccount?.toLowerCase().includes(searchWithdrawText.toLowerCase()) ||
        request.bankName?.toLowerCase().includes(searchWithdrawText.toLowerCase()) ||
        request.accountHolderName?.toLowerCase().includes(searchWithdrawText.toLowerCase()) ||
        request.amount?.toString().includes(searchWithdrawText)
      );
    }
    
    if (statusWithdrawFilter !== "all") {
      filtered = filtered.filter(request => request.status === statusWithdrawFilter);
    }
    
    setFilteredWithdrawRequests(filtered);
  }, [withdrawRequests, searchWithdrawText, statusWithdrawFilter]);

  const handleWithdrawSearch = (value: string) => {
    setSearchWithdrawText(value);
  };

  const handleWithdrawStatusFilter = (value: string) => {
    setStatusWithdrawFilter(value);
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const withdrawRequestColumns: ColumnsType<WithdrawRequest> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 150,
      render: (text) => <span className="text-xs font-mono">{text}</span>,
    },
    {
      title: "User ID",
      dataIndex: "userId",
      key: "userId",
      width: 150,
      render: (text) => <span className="font-medium">{text || "N/A"}</span>,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: 150,
      render: (amount) => (
        <span className="font-bold text-green-600">
          {amount ? formatPrice(amount) : "N/A"}
        </span>
      ),
    },
    {
      title: "Bank Name",
      dataIndex: "bankName",
      key: "bankName",
      width: 150,
      render: (text) => <span>{text || "N/A"}</span>,
    },
    {
      title: "Bank Account",
      dataIndex: "bankAccount",
      key: "bankAccount",
      width: 150,
      render: (text) => <span className="font-mono text-sm">{text || "N/A"}</span>,
    },
    {
      title: "Account Holder",
      dataIndex: "accountHolderName",
      key: "accountHolderName",
      width: 150,
      render: (text) => <span>{text || "N/A"}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const colorMap: Record<string, string> = {
          PENDING: "orange",
          APPROVED: "blue",
          COMPLETED: "success",
          REJECTED: "error",
          CANCELLED: "default",
        };
        return (
          <Tag color={colorMap[status as string] || "default"}>
            {status || "N/A"}
          </Tag>
        );
      },
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : "N/A",
    },
  ];

  return (
    <>
      {/* Withdraw Request Header */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <Input.Search
            placeholder="Search withdraw requests..."
            value={searchWithdrawText}
            onChange={(e) => setSearchWithdrawText(e.target.value)}
            onSearch={handleWithdrawSearch}
            allowClear
            className="max-w-md"
            prefix={<SearchOutlined className="text-gray-400" />}
          />
          <Button
            type="default"
            onClick={() => fetchWithdrawRequests({ pageNo: 0, pageSize: 100 })}
            className="whitespace-nowrap"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Withdraw Request Filter */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2">
          <FilterOutlined className="text-gray-400" />
          <span className="text-sm text-gray-600">Filter by:</span>
        </div>
        <Select
          placeholder="Status"
          value={statusWithdrawFilter}
          onChange={handleWithdrawStatusFilter}
          className="min-w-32"
          options={[
            { label: "All Status", value: "all" },
            { label: "Pending", value: "PENDING" },
            { label: "Approved", value: "APPROVED" },
            { label: "Completed", value: "COMPLETED" },
            { label: "Rejected", value: "REJECTED" },
            { label: "Cancelled", value: "CANCELLED" }
          ]}
        />
        {(statusWithdrawFilter !== "all" || searchWithdrawText) && (
          <Button
            type="text"
            size="small"
            onClick={() => {
              setSearchWithdrawText("");
              setStatusWithdrawFilter("all");
            }}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Withdraw Request Table */}
      <Table
        columns={withdrawRequestColumns}
        dataSource={filteredWithdrawRequests}
        rowKey="id"
        loading={withdrawLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} withdraw requests`,
        }}
        rowClassName="hover:bg-gray-50 transition-colors duration-200"
        className="bg-white rounded-lg border border-gray-200 overflow-x-auto"
        scroll={{ x: 1000 }}
      />
    </>
  );
};

export default WithdrawRequestsTab;

