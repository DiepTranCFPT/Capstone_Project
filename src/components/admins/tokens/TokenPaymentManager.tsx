import React, { useState } from "react";
import {
  Table,
  Button,
  Tag,
  Input,
  Space,
  Card,
  Tooltip,
  Typography,
  Tabs,
  Select,
  Form,
  Modal,
  InputNumber,
  message,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { TokenData } from "~/types/token";
import type { PaymentData } from "~/types/token";
import { tokens } from "~/data/tokens";
import { payments } from "~/data/payments";

const { Title } = Typography;
const { TabPane } = Tabs;

const TokenPaymentManager: React.FC = () => {
  // Tokens state
  const [tokenData, setTokenData] = useState(tokens);
  const [searchTokenText, setSearchTokenText] = useState("");
  const [statusTokenFilter, setStatusTokenFilter] = useState<string>("all");
  const [isTokenModalVisible, setIsTokenModalVisible] = useState(false);
  const [editingToken, setEditingToken] = useState<TokenData | null>(null);
  const [form] = Form.useForm();

  // Payments state
  const [paymentData, setPaymentData] = useState(payments);
  const [searchPaymentText, setSearchPaymentText] = useState("");
  const [statusPaymentFilter, setStatusPaymentFilter] = useState<string>("all");

  // Token handlers
  const handleTokenSearch = (value: string) => {
    setSearchTokenText(value);
    applyTokenFilters(value, statusTokenFilter);
  };

  const handleTokenStatusFilter = (value: string) => {
    setStatusTokenFilter(value);
    applyTokenFilters(searchTokenText, value);
  };

  const applyTokenFilters = (search: string, status: string) => {
    const filtered = tokens.filter(token => {
      const matchesSearch = token.tokenAmount.toString().includes(search.toLowerCase()) ||
                           token.price.toString().includes(search.toLowerCase());
      const matchesStatus = status === "all" || token.status === status;
      return matchesSearch && matchesStatus;
    });
    setTokenData(filtered);
  };

  const handleAddToken = () => {
    setEditingToken(null);
    form.resetFields();
    setIsTokenModalVisible(true);
  };

  const handleEditToken = (record: TokenData) => {
    setEditingToken(record);
    form.setFieldsValue(record);
    setIsTokenModalVisible(true);
  };

  const handleDeleteToken = (record: TokenData) => {
    // Implement delete logic
    message.success(`${record.tokenAmount} tokens deleted successfully`);
    setTokenData(prev => prev.filter(token => token.id !== record.id));
  };

  const handleTokenModalOk = () => {
    form.validateFields().then(values => {
      if (editingToken) {
        // Update existing
        setTokenData(prev => prev.map(token =>
          token.id === editingToken.id ? { ...token, ...values } : token
        ));
        message.success('Token package updated successfully');
      } else {
        // Add new
        const newToken: TokenData = {
          ...values,
          id: `TK-${Date.now()}`,
          status: 'Active',
        };
        setTokenData(prev => [...prev, newToken]);
        message.success('Token package added successfully');
      }
      setIsTokenModalVisible(false);
    });
  };

  // Payment handlers
  const handlePaymentSearch = (value: string) => {
    setSearchPaymentText(value);
    applyPaymentFilters(value, statusPaymentFilter);
  };

  const handlePaymentStatusFilter = (value: string) => {
    setStatusPaymentFilter(value);
    applyPaymentFilters(searchPaymentText, value);
  };

  const applyPaymentFilters = (search: string, status: string) => {
    const filtered = payments.filter(payment => {
      const matchesSearch = payment.userName.toLowerCase().includes(search.toLowerCase()) ||
                           payment.tokenAmount.toString().includes(search.toLowerCase()) ||
                           payment.transactionId.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === "all" || payment.status === status;
      return matchesSearch && matchesStatus;
    });
    setPaymentData(filtered);
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
              onClick={() => handleEditToken(record)}
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

  const paymentColumns: ColumnsType<PaymentData> = [
    {
      title: "Transaction ID",
      dataIndex: "transactionId",
      key: "transactionId",
      width: 150,
      render: (text) => <span className="text-xs font-mono">{text}</span>,
    },
    {
      title: "User",
      dataIndex: "userName",
      key: "userName",
      width: 150,
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Token Amount",
      dataIndex: "tokenAmount",
      key: "tokenAmount",
      width: 120,
      render: (tokens) => <span className="font-semibold text-blue-600">{tokens} tokens</span>,
    },
    {
      title: "Payment Amount",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      render: (amount, record) => <span className="font-bold text-green-600">{amount} {record.currency}</span>,
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 130,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => (
        <Tag color={status === "Success" ? "success" : status === "Pending" ? "orange" : "error"}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 150,
      render: (date) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Card className="shadow-sm border-0">
        <Title level={2} className="mb-4 text-gray-900">
          Token & Payment Management
        </Title>

        <Tabs defaultActiveKey="1">
          <TabPane tab="Token Packages" key="1">
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
                  onClick={handleAddToken}
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
                    setTokenData(tokens);
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
              dataSource={tokenData}
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
          </TabPane>

          <TabPane tab="Payments" key="2">
            {/* Payment Header */}
            <div className="mb-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <Input.Search
                  placeholder="Search payments..."
                  value={searchPaymentText}
                  onChange={(e) => setSearchPaymentText(e.target.value)}
                  onSearch={handlePaymentSearch}
                  allowClear
                  className="max-w-md"
                  prefix={<SearchOutlined className="text-gray-400" />}
                />
              </div>
            </div>

            {/* Payment Filter */}
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="flex items-center gap-2">
                <FilterOutlined className="text-gray-400" />
                <span className="text-sm text-gray-600">Filter by:</span>
              </div>
              <Select
                placeholder="Status"
                value={statusPaymentFilter}
                onChange={handlePaymentStatusFilter}
                className="min-w-32"
                options={[
                  { label: "All Status", value: "all" },
                  { label: "Success", value: "Success" },
                  { label: "Pending", value: "Pending" },
                  { label: "Failed", value: "Failed" }
                ]}
              />
              {(statusPaymentFilter !== "all" || searchPaymentText) && (
                <Button
                  type="text"
                  size="small"
                  onClick={() => {
                    setSearchPaymentText("");
                    setStatusPaymentFilter("all");
                    setPaymentData(payments);
                  }}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  Clear filters
                </Button>
              )}
            </div>

            {/* Payment Table */}
            <Table
              columns={paymentColumns}
              dataSource={paymentData}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} payments`,
              }}
              rowClassName="hover:bg-gray-50 transition-colors duration-200"
              className="bg-white rounded-lg border border-gray-200 overflow-x-auto"
              scroll={{ x: 1000 }}
            />
          </TabPane>
        </Tabs>

        {/* Token Modal */}
        <Modal
          title={editingToken ? "Edit Token Package" : "Add Token Package"}
          open={isTokenModalVisible}
          onOk={handleTokenModalOk}
          onCancel={() => setIsTokenModalVisible(false)}
          width={600}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="tokenAmount"
              label="Token Amount"
              rules={[{ required: true, message: "Please enter token amount" }]}
            >
              <InputNumber
                min={1}
                className="w-full"
                placeholder="Enter token amount (99, 199, 499, 999)"
              />
            </Form.Item>
            <Form.Item
              name="price"
              label="Price (USD)"
              rules={[{ required: true, message: "Please enter price" }]}
            >
              <InputNumber
                min={0.01}
                step={0.01}
                className="w-full"
                placeholder="Enter price in USD"
              />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default TokenPaymentManager;
