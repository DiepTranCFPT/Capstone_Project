import React, { useEffect, useState } from 'react';
import { Card, Empty, Spin, Tag, Button, Badge, Modal, Form, Input, message } from 'antd';
import { 
  BellOutlined, 
  CheckOutlined, 
  MailOutlined, 
  ReloadOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { notificationService } from '~/services/notificationService';
import type { NotificationResponse } from '~/types/notification';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.getPublicNotifications();
      console.log('Fetched notifications:', data);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (values: { message: string; receiverEmail?: string }) => {
    try {
      setSubmitting(true);
      console.log('Creating notification...', values);
      
      // Gửi với type mặc định là "NOTIFICATION SYSTEM"
      const result = await notificationService.createPublicNotification({
        type: 'NOTIFICATION SYSTEM',
        message: values.message,
        receiverEmail: values.receiverEmail
      });
      
      console.log('Notification created:', result);
      
      // Đóng modal TRƯỚC tiên - sử dụng setTimeout để đảm bảo state update
      setTimeout(() => {
        setIsModalOpen(false);
        form.resetFields();
      }, 0);
      
      // Hiển thị thông báo thành công
      message.success('Notification created successfully!');
      
      // Fetch lại danh sách thông báo
      setTimeout(() => {
        fetchNotifications();
      }, 100);
    } catch (err) {
      console.error('Failed to create notification:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create notification';
      message.error(errorMessage);
      // Không đóng modal nếu có lỗi để user có thể sửa và thử lại
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  // Helper to extract message content if it's stored as JSON string
  const getDisplayMessage = (message: string): string => {
    if (!message) return '';
    try {
      // Check if message is a JSON string like '{"type":"...","message":"..."}'
      if (message.startsWith('{') && message.includes('"message"')) {
        const parsed = JSON.parse(message);
        return parsed.message || message;
      }
    } catch {
      // Not JSON, return as-is
    }
    return message;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BellOutlined className="text-blue-600 text-2xl" />
                  </div>
                  Notifications
                </h1>
                <p className="text-gray-500 text-sm">Manage system notifications</p>
              </div>
            </div>
          </div>
          <Card variant="borderless" className="shadow-sm rounded-xl">
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
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BellOutlined className="text-blue-600 text-2xl" />
                  </div>
                  Notifications
                </h1>
                <p className="text-gray-500 text-sm">Manage system notifications</p>
              </div>
            </div>
          </div>
          <Card variant="borderless" className="shadow-sm rounded-xl">
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BellOutlined className="text-blue-600 text-2xl" />
                </div>
                Notifications
              </h1>
              <p className="text-gray-500 text-sm">Manage system notifications</p>
            </div>
            <div className="flex items-center gap-4">
              {unreadCount > 0 && (
                <Badge count={unreadCount} showZero={false}>
                  <span className="text-sm text-gray-600">
                    {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                  </span>
                </Badge>
              )}
              <Button 
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsModalOpen(true)}
                className="flex items-center"
              >
                Create
              </Button>
              <Button 
                icon={<ReloadOutlined />}
                onClick={fetchNotifications}
                className="flex items-center"
              >
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <Card variant="borderless" className="shadow-sm rounded-xl">
            <Empty
              description={
                <span className="text-gray-500">No notifications yet</span>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </Card>
        ) : (
          <div className="space-y-4">
            {notifications.map((item) => (
              <Card
                key={item.id}
                variant="borderless"
                className={`rounded-xl shadow-sm transition-all duration-300 hover:shadow-md ${
                  !item.read 
                    ? 'bg-white border-l-4 border-l-blue-500' 
                    : 'bg-white border-l-4 border-l-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Header: Type Tag and Timestamp */}
                    <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
                      <Tag 
                        color="default" 
                        className="text-xs bg-gray-100 text-gray-700 border-0"
                      >
                        {item.type}
                      </Tag>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}</span>
                        <span className="text-gray-400">
                          ({dayjs(item.createdAt).fromNow()})
                        </span>
                      </div>
                    </div>

                    {/* Main Message */}
                    <div className="mb-3">
                      <p className={`text-base font-semibold ${!item.read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {getDisplayMessage(item.message)}
                      </p>
                    </div>

                    {/* Email Source */}
                    {item.receiverEmail && (
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <MailOutlined className="text-xs" />
                        <span>{item.receiverEmail}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {!item.read && (
                    <div className="flex-shrink-0">
                      <Button
                        type="text"
                        icon={<CheckOutlined />}
                        onClick={() => handleMarkAsRead(item.id)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        Mark as read
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Notification Modal */}
      <Modal
        title="Create Notification"
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
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
        >
          <Form.Item
            name="message"
            label="Message"
            rules={[{ required: true, message: 'Please enter a message' }]}
          >
            <Input.TextArea rows={4} placeholder="Enter notification message..." />
          </Form.Item>

          <Form.Item className="mb-0 flex justify-end">
            <div className="flex gap-2">
              <Button onClick={() => {
                setIsModalOpen(false);
                form.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Create
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NotificationsPage;

