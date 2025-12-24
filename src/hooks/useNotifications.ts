import { useState, useCallback, useEffect } from 'react';
import { notificationService } from '~/services/notificationService';
import type { NotificationResponse, GetNotificationsParams } from '~/types/notification';
import { toast } from '~/components/common/Toast';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markingAsRead, setMarkingAsRead] = useState(false);
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false);

  const handleError = (err: unknown, defaultMessage: string) => {
    const e = err as Error;
    setError(e.message || defaultMessage);
    toast.error(e.message || defaultMessage);
  };

  // Fetch notifications with optional unreadOnly filter
  // unreadOnly = true -> fetch unread only
  // unreadOnly = undefined/null -> fetch all (read)
  const fetchNotifications = useCallback(async (params?: GetNotificationsParams) => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationService.getNotifications(params);
      setNotifications(data);
    } catch (err) {
      handleError(err, 'Not load notification');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch unread notifications only
  const fetchUnreadNotifications = useCallback(async () => {
    await fetchNotifications({ unreadOnly: true });
  }, [fetchNotifications]);

  // Fetch all notifications (for "Read" tab - all notifications)
  const fetchAllNotifications = useCallback(async () => {
    await fetchNotifications(); // No params = all notifications
  }, [fetchNotifications]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    setMarkingAsRead(true);
    try {
      const updatedNotification = await notificationService.markAsRead(notificationId);

      // Update local state optimistically
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? updatedNotification
            : notification
        )
      );

      toast.success('Mark as read');
    } catch (err) {
      handleError(err, 'Not update notification status');
    } finally {
      setMarkingAsRead(false);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    setMarkingAllAsRead(true);
    try {
      await notificationService.markAllAsRead();

      // Update local state optimistically
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );

      toast.success('All mark as read');
    } catch (err) {
      handleError(err, 'Not update notification status');
    } finally {
      setMarkingAllAsRead(false);
    }
  }, []);

  // Get unread notifications from current list
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(n => !n.read);
  }, [notifications]);

  // Get read notifications from current list  
  const getReadNotifications = useCallback(() => {
    return notifications.filter(n => n.read);
  }, [notifications]);

  // Get unread count from current list
  const unreadCount = notifications.filter(n => !n.read).length;

  // Initial load - fetch unread by default
  useEffect(() => {
    fetchUnreadNotifications();
  }, [fetchUnreadNotifications]);

  return {
    notifications,
    loading,
    error,
    markingAsRead,
    markingAllAsRead,
    unreadCount,
    fetchNotifications,
    fetchUnreadNotifications,
    fetchAllNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadNotifications,
    getReadNotifications
  };
};
