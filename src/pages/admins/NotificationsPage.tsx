import React, { useEffect, useState } from 'react';
import { Card, Empty, Spin, Button, Modal, Form, Input, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { 
  BellOutlined, 
  CheckOutlined, 
  ReloadOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  MailOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { usePublicNotifications } from '~/hooks/usePublicNotifications';
import type { NotificationResponse } from '~/types/notification';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const NotificationsPage: React.FC = () => {
  const {
    notifications,
    loading,
    error,
    submitting,
    fetchNotifications,
    createNotification,
    markAsRead
  } = usePublicNotifications();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleCreate = async (values: { message: string }) => {
    const success = await createNotification({
      message: values.message
    });
    
    if (success) {
      setIsModalOpen(false);
      form.resetFields();
    }
  };

  // Helper to extract message content if it's stored as JSON string
  const getDisplayMessage = (message: string): string => {
    if (!message) return '';
    try {
      if (message.startsWith('{') && message.includes('"message"')) {
        const parsed = JSON.parse(message);
        return parsed.message || message;
      }
    } catch {
    }
    return message;
  };

  // Table columns
  const columns: ColumnsType<NotificationResponse> = [
    {
      title: (
        <span className="text-gray-600 font-semibold">Message</span>
      ),
      dataIndex: 'message',
      key: 'message',
      render: (message: string, record) => (
        <div className="py-1">
          <p className={`text-sm leading-relaxed ${!record.read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
            {getDisplayMessage(message)}
          </p>
        </div>
      ),
    },
    {
      title: (
        <span className="text-gray-600 font-semibold">Receiver</span>
      ),
      dataIndex: 'receiverEmail',
      key: 'receiverEmail',
      width: 220,
      render: (email: string) => (
        email ? (
          <div className="flex items-center gap-2 text-gray-500">
            <MailOutlined className="text-blue-400" />
            <span className="text-sm">{email}</span>
          </div>
        ) : (
          <span className="text-gray-300 text-sm italic">All users</span>
        )
      ),
    },
    {
      title: (
        <span className="text-gray-600 font-semibold">Created</span>
      ),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => (
        <div className="flex items-center gap-2">
          <ClockCircleOutlined className="text-gray-400" />
          <div>
            <div className="text-sm text-gray-700">{dayjs(date).format('DD/MM/YYYY')}</div>
            <div className="text-xs text-gray-400">{dayjs(date).fromNow()}</div>
          </div>
        </div>
      ),
    },
    {
      title: (
        <span className="text-gray-600 font-semibold">Action</span>
      ),
      key: 'action',
      width: 130,
      align: 'center',
      render: (_, record) => (
        !record.read ? (
          <Button
            type="primary"
            size="small"
            icon={<CheckOutlined />}
            onClick={() => markAsRead(record.id)}
            className="bg-gradient-to-r from-green-500 to-emerald-500 border-0 shadow-sm hover:shadow-md transition-all"
          >
            Mark read
          </Button>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        )
      ),
    },
  ];

  if (loading && notifications.length === 0) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-1">
              <div className="p-3 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl shadow-lg">
                <BellOutlined className="text-white text-xl" />
              </div>
              Notifications
            </h1>
            <p className="text-gray-500 text-sm ml-14">Manage system notifications</p>
          </div>
          <Card className="shadow-lg rounded-2xl border-0">
            <div className="flex justify-center items-center py-20">
              <Spin size="large" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-1">
              <div className="p-3 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl shadow-lg">
                <BellOutlined className="text-white text-xl" />
              </div>
              Notifications
            </h1>
            <p className="text-gray-500 text-sm ml-14">Manage system notifications</p>
          </div>
          <Card className="shadow-lg rounded-2xl border-0">
            <div className="text-center py-12">
              <div className="text-red-500 text-lg mb-4">{error}</div>
              <Button 
                type="primary" 
                icon={<ReloadOutlined />}
                onClick={fetchNotifications}
                size="large"
              >
                Retry
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-1">
                <div className="p-3 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl shadow-lg">
                  <BellOutlined className="text-white text-xl" />
                </div>
                Notifications
              </h1>
              <p className="text-gray-500 text-sm ml-14">Manage system notifications</p>
            </div>
            <div className="flex items-center gap-3">

              <Button 
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsModalOpen(true)}
                size="large"
                className="bg-gradient-to-r from-teal-400 to-cyan-500 border-0 shadow-lg hover:shadow-xl transition-all h-10"
              >
                Create
              </Button>
              <Button 
                icon={<ReloadOutlined />}
                onClick={fetchNotifications}
                loading={loading}
                size="large"
                className="h-10 shadow-sm"
              >
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                <BellOutlined className="text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
                <p className="text-xs text-gray-500">Total Notifications</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <EyeOutlined className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{notifications.filter(n => n.read).length}</p>
                <p className="text-xs text-gray-500">Read</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Table */}
        <Card className="shadow-lg rounded-2xl border-0 overflow-hidden">
          <Table
            columns={columns}
            dataSource={notifications}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (total, range) => (
                <span className="text-gray-500">
                  Showing <strong>{range[0]}-{range[1]}</strong> of <strong>{total}</strong> notifications
                </span>
              ),
            }}
            locale={{
              emptyText: (
                <Empty
                  description={<span className="text-gray-500">No notifications yet</span>}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ),
            }}
            rowClassName={(record) => 
              !record.read 
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100' 
                : 'hover:bg-gray-50'
            }
            className="notifications-table"
          />
        </Card>
      </div>

      {/* Create Notification Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <PlusOutlined className="text-blue-600" />
            </div>
            <span>Create Notification</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        afterClose={() => {
          form.resetFields();
        }}
        footer={null}
        destroyOnHidden
        className="rounded-2xl"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          className="mt-4"
        >
          <Form.Item
            name="message"
            label={<span className="text-gray-700 font-medium">Message</span>}
            rules={[{ required: true, message: 'Please enter a message' }]}
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Enter notification message..." 
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end">
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  setIsModalOpen(false);
                  form.resetFields();
                }}
                className="rounded-lg"
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={submitting}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 border-0 rounded-lg"
              >
                Create Notification
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .notifications-table .ant-table-thead > tr > th {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-bottom: 2px solid #e2e8f0;
          padding: 16px 12px;
        }
        .notifications-table .ant-table-tbody > tr > td {
          padding: 14px 12px;
          border-bottom: 1px solid #f1f5f9;
        }
        .notifications-table .ant-table-tbody > tr:hover > td {
          background: transparent !important;
        }
        .notifications-table .ant-pagination {
          padding: 16px;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default NotificationsPage;
