import axiosInstance from "~/configs/axios";
import type { NotificationResponse, GetNotificationsParams } from '~/types/notification';

interface NotificationsApiResponse {
  code: number;
  message: string;
  data: NotificationResponse[];
}

interface SingleNotificationApiResponse {
  code: number;
  message: string;
  data: NotificationResponse;
}

export const notificationService = {
  /**
   * Get all notifications for the current user
   * GET /notifications
   * @param params - Optional query parameters (unreadOnly)
   */
  async getNotifications(params?: GetNotificationsParams): Promise<NotificationResponse[]> {
    const response = await axiosInstance.get<NotificationsApiResponse>('/notifications', {
      params
    });
    return response.data.data || [];
  },

  /**
   * Mark a specific notification as read
   * POST /notifications/{id}
   * @param notificationId - The ID of the notification to mark as read
   */
  async markAsRead(notificationId: string): Promise<NotificationResponse> {
    const response = await axiosInstance.post<SingleNotificationApiResponse>(
      `/notifications/${notificationId}`
    );
    return response.data.data;
  },

  /**
   * Mark all notifications as read
   * POST /notifications/readAll
   */
  async markAllAsRead(): Promise<void> {
    await axiosInstance.post('/notifications/readAll');
  }
};
