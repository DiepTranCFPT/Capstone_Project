import React, { useEffect, useState } from 'react';
import { Card, Badge, Empty, Spin, Pagination } from 'antd';
import { 
  BellFilled, 
  ClockCircleOutlined,
  RightOutlined
} from '@ant-design/icons';
import { usePublicNotifications } from '~/hooks/usePublicNotifications';
import type { NotificationResponse } from '~/types/notification';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const Notification: React.FC = () => {
  const {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    fetchNotifications
  } = usePublicNotifications();

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch all notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Calculate paginated notifications
  const paginatedNotifications = notifications.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    return dayjs(dateString).fromNow();
  };

  // Format date
  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('YYYY-MM-DD');
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

  // Handle notification click
  const handleNotificationClick = async (notification: NotificationResponse) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
  };

  // Notification card component
  const NotificationCard: React.FC<{ notification: NotificationResponse }> = ({ notification }) => {
    const isNew = !notification.read;
    const daysSinceCreated = dayjs().diff(dayjs(notification.createdAt), 'day');
    const isRecent = daysSinceCreated <= 7;

    return (
      <Card
        className={`mb-3 transition-all duration-300 cursor-pointer hover:shadow-md ${
          isNew 
            ? 'border-l-4 border-l-teal-500 bg-teal-50/50' 
            : 'bg-white hover:bg-gray-50'
        }`}
        onClick={() => handleNotificationClick(notification)}
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <BellFilled className="text-xl text-teal-600" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium bg-teal-100 text-teal-700`}>
                {notification.type}
              </span>
              <div className="text-right">
                <p className="text-xs text-gray-400 mb-1">{formatDate(notification.createdAt)}</p>
                {isNew && isRecent && (
                  <Badge 
                    count="NEW EVENT" 
                    style={{ 
                      backgroundColor: '#3b82f6',
                      fontSize: '10px',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}
                  />
                )}
              </div>
            </div>

            <p className={`text-base mb-2 ${isNew ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
              {getDisplayMessage(notification.message)}
            </p>

            {notification.receiverEmail && (
              <p className="text-sm text-gray-500 mb-2">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                {notification.receiverEmail}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 text-xs text-gray-400 mt-2">
              <ClockCircleOutlined />
              <span>{formatTimeAgo(notification.createdAt)}</span>
              {isNew && (
                <RightOutlined className="text-gray-300" />
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/30">
              <BellFilled style={{ color: 'white' }} className="text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="text-sm text-gray-500">
                {notifications.length} total • {unreadCount} unread
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <span className="text-sm text-gray-500">
              {unreadCount} unread
            </span>
          )}
        </div>

        {/* Main Card */}
        <Card className="shadow-lg rounded-2xl overflow-hidden bg-white">
          {/* Content */}
          <div className="p-4">
            {loading ? (
              <div className="flex flex-col justify-center items-center py-16">
                <Spin size="large" />
                <p className="text-gray-400 text-sm mt-4">Loading notifications...</p>
              </div>
            ) : notifications.length > 0 ? (
              <>
                <div className='flex flex-col gap-3'>
                  {paginatedNotifications.map((notification) => (
                    <NotificationCard key={notification.id} notification={notification} />
                  ))}
                </div>
                {notifications.length > pageSize && (
                  <div className="flex justify-center mt-6">
                    <Pagination
                      current={currentPage}
                      total={notifications.length}
                      pageSize={pageSize}
                      onChange={(page) => setCurrentPage(page)}
                      showSizeChanger={false}
                      showTotal={(total, range) => `${range[0]}-${range[1]} of ${total}`}
                    />
                  </div>
                )}
              </>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div className="text-center">
                    <p className="text-gray-500 font-medium mb-1">No notifications yet</p>
                    <p className="text-gray-400 text-sm">
                      Notifications will appear here when you receive them.
                    </p>
                  </div>
                }
                className="py-16"
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Notification;
