import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Empty, Spin, Tabs } from 'antd';
import { BellFilled, CheckOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNotifications } from '~/hooks/useNotifications';
import type { NotificationResponse } from '~/types/notification';

const NotificationCenterPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'unread' | 'all'>('unread');

  const {
    notifications,
    loading,
    unreadCount,
    markingAsRead,
    markingAllAsRead,
    markAsRead,
    markAllAsRead,
    fetchUnreadNotifications,
    fetchAllNotifications
  } = useNotifications();

  // Fetch notifications when tab changes
  useEffect(() => {
    if (activeTab === 'unread') {
      fetchUnreadNotifications();
    } else {
      fetchAllNotifications();
    }
  }, [activeTab, fetchUnreadNotifications, fetchAllNotifications]);

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  // Format full date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get type styles
  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'SYSTEM':
        return { bg: 'bg-gradient-to-r from-purple-500 to-indigo-500', icon: '🔔', badge: 'bg-purple-100 text-purple-700' };
      case 'EXAM':
        return { bg: 'bg-gradient-to-r from-orange-500 to-amber-500', icon: '📝', badge: 'bg-orange-100 text-orange-700' };
      case 'SCORE':
        return { bg: 'bg-gradient-to-r from-green-500 to-emerald-500', icon: '🏆', badge: 'bg-green-100 text-green-700' };
      default:
        return { bg: 'bg-gradient-to-r from-teal-500 to-cyan-500', icon: '📢', badge: 'bg-teal-100 text-teal-700' };
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification: NotificationResponse) => {
    if (!notification.read && !markingAsRead) {
      await markAsRead(notification.id);
    }
  };

  // Notification card component
  const NotificationCard: React.FC<{ notification: NotificationResponse }> = ({ notification }) => {
    const typeStyles = getTypeStyles(notification.type);

    return (
      <Card
        size="small"
        className={`mb-3 transition-all duration-300 cursor-pointer hover:shadow-lg ${!notification.read
            ? 'border-l-4 border-l-teal-500 bg-gradient-to-r from-teal-50 to-white'
            : 'bg-white hover:bg-gray-50'
          }`}
        onClick={() => handleNotificationClick(notification)}
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`w-12 h-12 ${typeStyles.bg} rounded-xl flex items-center justify-center text-xl shadow-lg flex-shrink-0`}>
            {typeStyles.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${typeStyles.badge}`}>
                {notification.type}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-400 flex items-center gap-1" title={formatDate(notification.createdAt)}>
                  <ClockCircleOutlined className="text-[10px]" />
                  {formatTimeAgo(notification.createdAt)}
                </span>
                {!notification.read && (
                  <Button
                    type="text"
                    size="small"
                    icon={<CheckOutlined />}
                    loading={markingAsRead}
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification.id);
                    }}
                    className="text-teal-600 hover:text-teal-700"
                  >
                    Mark as read
                  </Button>
                )}
              </div>
            </div>
            <p className={`text-base leading-relaxed mb-2 ${!notification.read ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
              {notification.message}
            </p>
            <p className="text-sm text-gray-400">
              To: {notification.receiverEmail}
            </p>
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
              <h1 className="text-2xl font-bold text-gray-900">Notification Center</h1>
              <p className="text-sm text-gray-500">
                {notifications.length} total • {unreadCount} unread
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <Button
              type="primary"
              icon={<CheckOutlined />}
              loading={markingAllAsRead}
              onClick={markAllAsRead}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 border-none shadow-lg shadow-teal-500/30 hover:shadow-xl"
            >
              Mark all as read
            </Button>
          )}
        </div>

        {/* Main Card */}
        <Card className="shadow-lg rounded-2xl overflow-hidden">
          {/* Tabs */}
          <Tabs
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as 'unread' | 'all')}
            className="px-2"
            items={[
              {
                key: 'unread',
                label: (
                  <span className="flex items-center gap-2 px-2 font-medium">
                    Unread
                    {unreadCount > 0 && (
                      <Badge
                        count={unreadCount}
                        style={{ backgroundColor: '#14b8a6' }}
                      />
                    )}
                  </span>
                ),
              },
              {
                key: 'all',
                label: (
                  <span className="flex items-center gap-2 px-2 font-medium">
                    All
                    {notifications.length > 0 && (
                      <Badge
                        count={notifications.length}
                        style={{ backgroundColor: '#9ca3af' }}
                      />
                    )}
                  </span>
                ),
              },
            ]}
          />

          {/* Content */}
          <div className="p-4">
            {loading ? (
              <div className="flex flex-col justify-center items-center py-16">
                <Spin size="large" />
                <p className="text-gray-400 text-sm mt-4">Loading notifications...</p>
              </div>
            ) : notifications.length > 0 ? (
              <div>
                {notifications.map((notification) => (
                  <NotificationCard key={notification.id} notification={notification} />
                ))}
              </div>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div className="text-center">
                    <p className="text-gray-500 font-medium mb-1">
                      {activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {activeTab === 'unread'
                        ? "You're all caught up! Check back later for new updates."
                        : 'Notifications will appear here when you receive them.'
                      }
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

export default NotificationCenterPage;
