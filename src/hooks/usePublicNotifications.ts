import { useState, useCallback } from 'react';
import { message } from 'antd';
import { notificationService } from '~/services/notificationService';
import type { NotificationResponse } from '~/types/notification';

interface CreateNotificationData {
  type: string;
  message: string;
  receiverEmail?: string;
}

/**
 * Hook for managing public notifications (admin use)
 */
export const usePublicNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch public notifications list
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.getPublicNotifications();
      const sortedData = Array.isArray(data) 
        ? data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        : [];
      setNotifications(sortedData);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create notification with response handling
  const createNotification = useCallback(async (data: CreateNotificationData): Promise<boolean> => {
    try {
      setSubmitting(true);
      
      const response = await notificationService.createPublicNotification({
        type: data.type || 'NOTIFICATION SYSTEM',
        message: data.message,
        receiverEmail: data.receiverEmail
      });

      // Handle string response (success message)
      if (typeof response === 'string') {
        message.success('Notification created successfully!');
        await fetchNotifications();
        return true;
      }

      // Handle object response
      if (response && typeof response === 'object') {
        message.success('Notification created successfully!');
        await fetchNotifications();
        return true;
      }

      message.success('Notification created successfully!');
      await fetchNotifications();
      return true;
    } catch (err) {
      console.error('Failed to create notification:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create notification';
      message.error(errorMessage);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [fetchNotifications]);

  // Mark as read
  const markAsRead = useCallback(async (id: string) => {
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
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    loading,
    error,
    submitting,
    unreadCount,
    fetchNotifications,
    createNotification,
    markAsRead
  };
};
