import React, { useState, useEffect } from 'react';
import { Tabs, Badge, Button, Empty, Spin, Card } from 'antd';
import { BellFilled, CheckOutlined } from '@ant-design/icons';
import { useNotifications } from '~/hooks/useNotifications';
import type { NotificationResponse } from '~/types/notification';

const NotificationsPage: React.FC = () => {
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

    // Handle notification click
    const handleNotificationClick = async (notification: NotificationResponse) => {
        if (!notification.read && !markingAsRead) {
            await markAsRead(notification.id);
        }
    };

    // Handle mark all as read
    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
    };

    // Notification item component
    const NotificationItem: React.FC<{ notification: NotificationResponse }> = ({ notification }) => (
        <Card
            size="small"
            className={`mb-3 transition-all duration-200 cursor-pointer hover:shadow-md ${!notification.read
                    ? 'border-l-4 border-l-teal-500 bg-teal-50/50'
                    : 'bg-white hover:bg-gray-50'
                }`}
            onClick={() => handleNotificationClick(notification)}
        >
            <div className="flex items-start gap-4">
                {/* Status indicator */}
                <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${!notification.read ? 'bg-teal-500' : 'bg-gray-300'
                    }`} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${notification.type === 'SYSTEM'
                                ? 'bg-purple-100 text-purple-700'
                                : notification.type === 'EXAM'
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-teal-100 text-teal-700'
                            }`}>
                            {notification.type}
                        </span>
                        <div className="flex items-center gap-4">
                            <span className="text-xs text-gray-400" title={formatDate(notification.createdAt)}>
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
                    <p className="text-base text-gray-700 mb-2">
                        {notification.message}
                    </p>
                    <p className="text-sm text-gray-400">
                        To: {notification.receiverEmail}
                    </p>
                </div>
            </div>
        </Card>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                            <BellFilled className="text-2xl text-teal-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
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
                            onClick={handleMarkAllAsRead}
                            className="bg-teal-500 hover:bg-teal-600 border-teal-500"
                        >
                            Mark all as read
                        </Button>
                    )}
                </div>

                {/* Tabs */}
                <Card className="shadow-sm">
                    <Tabs
                        activeKey={activeTab}
                        onChange={(key) => setActiveTab(key as 'unread' | 'all')}
                        className="mb-4"
                        items={[
                            {
                                key: 'unread',
                                label: (
                                    <span className="flex items-center gap-2 px-2">
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
                                    <span className="flex items-center gap-2 px-2">
                                        All
                                    </span>
                                ),
                            },
                        ]}
                    />

                    {/* Notification List */}
                    {loading ? (
                        <div className="flex justify-center items-center py-16">
                            <Spin size="large" />
                        </div>
                    ) : notifications.length > 0 ? (
                        <div>
                            {notifications.map((notification) => (
                                <NotificationItem key={notification.id} notification={notification} />
                            ))}
                        </div>
                    ) : (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                activeTab === 'unread'
                                    ? "You're all caught up! No unread notifications."
                                    : 'No notifications yet.'
                            }
                            className="py-16"
                        />
                    )}
                </Card>
            </div>
        </div>
    );
};

export default NotificationsPage;
