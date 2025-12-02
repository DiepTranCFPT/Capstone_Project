import React, { useState, useEffect } from "react";
import { Table, Button, Tag, Input, Select, Alert, Popconfirm, message } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { WithdrawRequest } from "~/types/tokenTransaction";
import { useAdminWithdrawRequests } from "~/hooks/useAdminWithdrawRequests";
import TokenTransactionService from "~/services/tokenTransactionService";

const WithdrawRequestsTab: React.FC = () => {
  const {
    requests: withdrawRequests,
    loading: withdrawLoading,
    error: withdrawError,
    fetchWithdrawRequests,
  } = useAdminWithdrawRequests();
  const [searchWithdrawText, setSearchWithdrawText] = useState("");
  const [statusWithdrawFilter, setStatusWithdrawFilter] = useState<string>("all");
  const [filteredWithdrawRequests, setFilteredWithdrawRequests] = useState<WithdrawRequest[]>([]);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  // Fetch withdraw requests on mount
  useEffect(() => {
    const params: { pageNo: number; pageSize: number; status?: string } = {
      pageNo: 0,
      pageSize: 100,
    };
    if (statusWithdrawFilter !== "all") {
      params.status = statusWithdrawFilter;
    }
    fetchWithdrawRequests(params);
  }, [fetchWithdrawRequests, statusWithdrawFilter]);

  // Filter withdraw requests
  useEffect(() => {
    let filtered = withdrawRequests;
    
    if (searchWithdrawText) {
      const keyword = searchWithdrawText.toLowerCase();
      filtered = filtered.filter(request =>
        request.transactionId?.toLowerCase().includes(keyword) ||
        request.teacherName?.toLowerCase().includes(keyword) ||
        request.bankingNumber?.toLowerCase().includes(keyword) ||
        request.nameBanking?.toLowerCase().includes(keyword) ||
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

  const handleMarkAsCompleted = async (record: WithdrawRequest) => {
    if (!record.transactionId) {
      message.error("Không tìm thấy transactionId của yêu cầu rút tiền.");
      return;
    }
    try {
      setConfirmingId(record.transactionId);
      await TokenTransactionService.confirmWithdrawal({
        transactionId: record.transactionId,
        approved: true,
        adminNote: "Đã chuyển tiền cho giáo viên",
      });
      message.success("Đã xác nhận đã chuyển tiền cho giáo viên.");
      // Reload danh sách theo filter hiện tại
      await fetchWithdrawRequests({
        pageNo: 0,
        pageSize: 100,
        ...(statusWithdrawFilter !== "all" ? { status: statusWithdrawFilter } : {}),
      });
    } catch (error) {
      // Log chi tiết lỗi để dễ debug, đồng thời tránh lỗi ESLint "no-unused-vars"
      // Nếu không cần dùng `error`, có thể bỏ hẳn tham số: `catch { ... }`
      console.error("Xác nhận rút tiền thất bại:", error);
      message.error("Xác nhận rút tiền thất bại. Vui lòng thử lại.");
    } finally {
      setConfirmingId(null);
    }
  };

  const withdrawRequestColumns: ColumnsType<WithdrawRequest> = [
    {
      title: "ID",
      dataIndex: "transactionId",
      key: "transactionId",
      width: 220,
      render: (text) => <span className="text-xs font-mono">{text}</span>,
    },
    {
      title: "Teacher",
      dataIndex: "teacherName",
      key: "teacherName",
      width: 200,
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
      dataIndex: "nameBanking",
      key: "nameBanking",
      width: 150,
      render: (text) => <span>{text || "N/A"}</span>,
    },
    {
      title: "Bank Account",
      dataIndex: "bankingNumber",
      key: "bankingNumber",
      width: 150,
      render: (text) => <span className="font-mono text-sm">{text || "N/A"}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const normalized = (status as string | undefined)?.toUpperCase() || "";
        const colorMap: Record<string, string> = {
          PENDING: "orange",
          APPROVED: "blue",
          COMPLETED: "success",
          REJECTED: "error",
          CANCELLED: "default",
        };
        return (
          <Tag color={colorMap[normalized] || "default"}>
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
    {
      title: "Action",
      key: "action",
      width: 160,
      fixed: "right",
      render: (_, record) => (
        <Popconfirm
          title="Xác nhận đã chuyển tiền?"
          description={`Bạn chắc chắn đã chuyển ${formatPrice(record.amount)} cho ${record.teacherName || "giáo viên này"}?`}
          okText="Đã chuyển"
          cancelText="Hủy"
          onConfirm={() => handleMarkAsCompleted(record)}
          disabled={record.status?.toUpperCase() !== "PENDING"}
        >
          <Button
            type="primary"
            size="small"
            disabled={record.status?.toUpperCase() !== "PENDING"}
            loading={confirmingId === record.transactionId}
          >
            Đã chuyển tiền
          </Button>
        </Popconfirm>
      ),
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
            onClick={() =>
              fetchWithdrawRequests({
                pageNo: 0,
                pageSize: 100,
                ...(statusWithdrawFilter !== "all" ? { status: statusWithdrawFilter } : {}),
              })
            }
            className="whitespace-nowrap"
          >
            Refresh
          </Button>
        </div>
      </div>

      {withdrawError && (
        <Alert
          type="error"
          message="Không thể tải danh sách yêu cầu rút tiền"
          description={withdrawError}
          className="mb-4"
          showIcon
        />
      )}

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

