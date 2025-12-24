import React, { useState, useEffect } from 'react';
import { Popover, Tabs, Badge, Button, Spin } from 'antd';
import { BellOutlined, CheckOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '~/hooks/useNotifications';
import type { NotificationResponse } from '~/types/notification';

const NotificationDropdown: React.FC = () => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'unread' | 'all'>('unread');

    const {
        notifications,
        loading,
        unreadCount,
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
            return `${diffDays}d ago`;
        } else if (diffHours > 0) {
            return `${diffHours}h ago`;
        } else if (diffMinutes > 0) {
            return `${diffMinutes}m ago`;
        } else {
            return 'Just now';
        }
    };

    // Get notification icon based on type
    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'SYSTEM':
                return { bg: 'bg-gradient-to-r from-purple-500 to-indigo-500', icon: '🔔' };
            case 'EXAM':
                return { bg: 'bg-gradient-to-r from-orange-500 to-amber-500', icon: '📝' };
            case 'SCORE':
                return { bg: 'bg-gradient-to-r from-green-500 to-emerald-500', icon: '🏆' };
            default:
                return { bg: 'bg-gradient-to-r from-teal-500 to-cyan-500', icon: '📢' };
        }
    };

    // Handle notification click
    const handleNotificationClick = async (notification: NotificationResponse) => {
        if (!notification.read) {
            await markAsRead(notification.id);
        }
    };

    // Handle mark all as read
    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
    };

    // Navigate to notifications page
    const handleViewAll = () => {
        setOpen(false);
        navigate('/notifications');
    };

    // Notification item component
    const NotificationItem: React.FC<{ notification: NotificationResponse }> = ({ notification }) => {
        const typeStyles = getTypeStyles(notification.type);

        return (
            <div
                className={`group relative p-4 cursor-pointer transition-all duration-300 border-b border-gray-100 last:border-b-0 hover:bg-gradient-to-r hover:from-gray-50 hover:to-teal-50/30 ${!notification.read ? 'bg-gradient-to-r from-teal-50/50 to-transparent' : ''
                    }`}
                onClick={() => handleNotificationClick(notification)}
            >
                {/* Unread indicator */}
                {!notification.read && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-400 to-teal-600 rounded-r" />
                )}

                <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`w-10 h-10 ${typeStyles.bg} rounded-xl flex items-center justify-center text-lg shadow-lg shadow-teal-500/20 flex-shrink-0`}>
                        {typeStyles.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${notification.type === 'SYSTEM'
                                    ? 'bg-purple-100 text-purple-700'
                                    : notification.type === 'EXAM'
                                        ? 'bg-orange-100 text-orange-700'
                                        : 'bg-teal-100 text-teal-700'
                                }`}>
                                {notification.type}
                            </span>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                <ClockCircleOutlined className="text-[10px]" />
                                {formatTimeAgo(notification.createdAt)}
                            </span>
                        </div>
                        <p className={`text-sm leading-relaxed line-clamp-2 ${!notification.read ? 'text-gray-800 font-medium' : 'text-gray-600'
                            }`}>
                            {notification.message}
                        </p>
                    </div>
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-teal-200 rounded-lg pointer-events-none transition-all duration-300" />
            </div>
        );
    };

    // Dropdown content
    const content = (
        <div className="w-96 max-h-[520px] flex flex-col bg-white rounded-xl overflow-hidden shadow-2xl">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                            <BellOutlined className="text-white text-xl" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Notifications</h3>
                            <p className="text-teal-100 text-xs">
                                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                            </p>
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            type="text"
                            size="small"
                            icon={<CheckOutlined />}
                            loading={markingAllAsRead}
                            onClick={handleMarkAllAsRead}
                            className="!text-white hover:!bg-white/20 border-none shadow-none"
                        >
                            Mark all read
                        </Button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="px-4 pt-3 border-b border-gray-100">
                <Tabs
                    activeKey={activeTab}
                    onChange={(key) => setActiveTab(key as 'unread' | 'all')}
                    className="notification-tabs"
                    items={[
                        {
                            key: 'unread',
                            label: (
                                <span className="flex items-center gap-2 font-medium">
                                    Unread
                                    {unreadCount > 0 && (
                                        <Badge
                                            count={unreadCount}
                                            size="small"
                                            style={{
                                                backgroundColor: '#14b8a6',
                                                boxShadow: '0 2px 8px rgba(20, 184, 166, 0.4)'
                                            }}
                                        />
                                    )}
                                </span>
                            ),
                        },
                        {
                            key: 'all',
                            label: (
                                <span className="flex items-center gap-2 font-medium">
                                    All
                                </span>
                            ),
                        },
                    ]}
                />
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto max-h-[280px]">
                {loading ? (
                    <div className="flex flex-col justify-center items-center py-16">
                        <Spin size="large" />
                        <p className="text-gray-400 text-sm mt-3">Loading notifications...</p>
                    </div>
                ) : notifications.length > 0 ? (
                    <div>
                        {notifications.slice(0, 8).map((notification) => (
                            <NotificationItem key={notification.id} notification={notification} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 rounded-full flex items-center justify-center mb-4">
                            <BellOutlined className="text-3xl text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-medium mb-1">
                            {activeTab === 'unread' ? 'No unread notifications' : 'No notifications'}
                        </p>
                        <p className="text-gray-400 text-sm text-center">
                            {activeTab === 'unread'
                                ? "You're all caught up! Check back later."
                                : 'Notifications will appear here.'
                            }
                        </p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 p-3 bg-gray-50/50">
                <Button
                    type="default"
                    block
                    onClick={handleViewAll}
                    className="!border-teal-200 !text-teal-600 hover:!bg-teal-50 hover:!border-teal-300 font-medium h-10 rounded-lg transition-all duration-300"
                >
                    View all notifications →
                </Button>
            </div>
        </div>
    );

    return (
        <Popover
            content={content}
            trigger="click"
            placement="bottomRight"
            open={open}
            onOpenChange={setOpen}
            overlayClassName="notification-dropdown-popover"
            arrow={false}
            overlayInnerStyle={{ padding: 0, borderRadius: '16px', overflow: 'hidden' }}
        >
            <button
                type="button"
                title="Notifications"
                className="relative w-9 h-9 md:w-11 md:h-11 flex items-center justify-center rounded-full border border-teal-100 text-teal-500 hover:bg-teal-50 hover:scale-105 transition-all duration-300 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-300"
            >
                <BellOutlined className="text-lg md:text-xl" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>
        </Popover>
    );
};

export default NotificationDropdown;
