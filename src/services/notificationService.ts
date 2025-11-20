import type { Notification, NotificationFilter, NotificationStats } from '~/types/notification';
// import axiosInstance from '~/configs/axios'; // Commented out for now, will be used when backend API is ready
// import type { ApiResponse } from '~/types/api'; // Commented out for now, will be used when backend API is ready
import { notifications as mockNotifications } from '~/data/notifications';

// For now, using mock data as backend API is not implemented
export const notificationService = {
  // Get all notifications for the current user
  async getNotifications(filter?: NotificationFilter): Promise<Notification[]> {
    try {
      // TODO: Replace with actual API call when backend is ready
      // const response = await axiosInstance.get<ApiResponse<Notification[]>>('/notifications', {
      //   params: filter
      // });
      // return response.data.data || [];

      // Mock implementation
      let filteredNotifications = [...mockNotifications];

      if (filter) {
        if (filter.type) {
          filteredNotifications = filteredNotifications.filter(n => n.type === filter.type);
        }
        if (filter.priority) {
          filteredNotifications = filteredNotifications.filter(n => n.priority === filter.priority);
        }
        if (filter.isRead !== undefined) {
          filteredNotifications = filteredNotifications.filter(n => n.isRead === filter.isRead);
        }
        if (filter.studentId) {
          filteredNotifications = filteredNotifications.filter(n => n.studentId === filter.studentId);
        }
      }

      // Sort by creation date, newest first
      return filteredNotifications.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      throw new Error('Failed to load notifications');
    }
  },

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      // TODO: Replace with actual API call
      // await axiosInstance.put(`/notifications/${notificationId}/read`);

      // Mock implementation
      const notification = mockNotifications.find(n => n.id === notificationId);
      if (notification) {
        notification.isRead = true;
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw new Error('Failed to update notification status');
    }
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    try {
      // TODO: Replace with actual API call
      // await axiosInstance.put('/notifications/read-all');

      // Mock implementation
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw new Error('Failed to update notifications status');
    }
  },

  // Dismiss/delete notification
  async dismissNotification(notificationId: string): Promise<void> {
    try {
      // TODO: Replace with actual API call
      // await axiosInstance.delete(`/notifications/${notificationId}`);

      // Mock implementation
      const index = mockNotifications.findIndex(n => n.id === notificationId);
      if (index !== -1) {
        mockNotifications.splice(index, 1);
      }
    } catch (error) {
      console.error('Failed to dismiss notification:', error);
      throw new Error('Failed to dismiss notification');
    }
  },

  // Get notification statistics
  async getNotificationStats(): Promise<NotificationStats> {
    try {
      // TODO: Replace with actual API call
      // const response = await axiosInstance.get<ApiResponse<NotificationStats>>('/notifications/stats');
      // return response.data.data || { total: 0, unread: 0, highPriority: 0 };

      // Mock implementation
      const allNotifications = mockNotifications;
      const unread = allNotifications.filter(n => !n.isRead);
      const highPriority = allNotifications.filter(n => n.priority === 'high');

      return {
        total: allNotifications.length,
        unread: unread.length,
        highPriority: highPriority.length
      };
    } catch (error) {
      console.error('Failed to fetch notification stats:', error);
      return { total: 0, unread: 0, highPriority: 0 };
    }
  }
};
