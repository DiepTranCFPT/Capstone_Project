import { useState, useCallback, useEffect } from 'react';
import { notificationService } from '~/services/notificationService';
import type { Notification, NotificationFilter, NotificationStats } from '~/types/notification';
import { toast } from '~/components/common/Toast';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({ total: 0, unread: 0, highPriority: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: unknown, defaultMessage: string) => {
    setLoading(false);
    const e = err as Error;
    setError(e.message || defaultMessage);
    toast.error(e.message || defaultMessage);
  };

  // Fetch all notifications with optional filtering
  const fetchNotifications = useCallback(async (filter?: NotificationFilter) => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationService.getNotifications(filter);
      setNotifications(data);

      // Update stats after fetching notifications
      const stats = await notificationService.getNotificationStats();
      setStats(stats);
    } catch (err) {
      handleError(err, 'Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);

      // Update local state optimistically
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      // Refresh stats
      const updatedStats = await notificationService.getNotificationStats();
      setStats(updatedStats);

      toast.success('Đã đánh dấu là đã đọc');
    } catch (err) {
      handleError(err, 'Không thể cập nhật trạng thái thông báo');
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();

      // Update local state optimistically
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      );

      // Refresh stats
      const updatedStats = await notificationService.getNotificationStats();
      setStats(updatedStats);

      toast.success('Đã đánh dấu tất cả là đã đọc');
    } catch (err) {
      handleError(err, 'Không thể cập nhật trạng thái thông báo');
    }
  }, []);

  // Dismiss/delete notification
  const dismissNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationService.dismissNotification(notificationId);

      // Remove from local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));

      // Refresh stats
      const updatedStats = await notificationService.getNotificationStats();
      setStats(updatedStats);

      toast.success('Đã xóa thông báo');
    } catch (err) {
      handleError(err, 'Không thể xóa thông báo');
    }
  }, []);

  // Get notification statistics
  const fetchStats = useCallback(async () => {
    try {
      const stats = await notificationService.getNotificationStats();
      setStats(stats);
    } catch (err) {
      handleError(err, 'Không thể tải thống kê thông báo');
    }
  }, []);

  // Filter notifications by type
  const filterByType = useCallback((type: string) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  // Filter unread notifications
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(n => !n.isRead);
  }, [notifications]);

  // Filter high priority notifications
  const getHighPriorityNotifications = useCallback(() => {
    return notifications.filter(n => n.priority === 'high');
  }, [notifications]);

  // Initial load
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    stats,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    fetchStats,
    filterByType,
    getUnreadNotifications,
    getHighPriorityNotifications
  };
};
