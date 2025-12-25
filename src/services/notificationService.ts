import axiosInstance from "~/configs/axios";
import type { NotificationResponse, GetNotificationsParams } from '~/types/notification';
import type { ApiResponse } from '~/types/api';

/**
 * Helper function to normalize API response to array format
 * Handles: array, single object, or ApiResponse wrapper
 */
function normalizeToArray<T>(response: unknown): T[] {
  if (!response) return [];

  // If wrapped in ApiResponse format (has 'data' property)
  if (typeof response === 'object' && response !== null && 'data' in response) {
    return normalizeToArray<T>((response as ApiResponse<T | T[]>).data);
  }

  // If it's already an array, return it
  if (Array.isArray(response)) {
    return response;
  }

  // If it's a single object, wrap in array
  if (typeof response === 'object' && response !== null) {
    return [response as T];
  }

  return [];
}

/**
 * Helper function to extract single object from API response
 * Handles: direct object or ApiResponse wrapper
 */
function normalizeToSingle<T>(response: unknown, errorMessage: string): T {
  if (!response) {
    throw new Error(errorMessage);
  }

  // If it's a direct object with 'id' (not ApiResponse)
  if (typeof response === 'object' && response !== null && 'id' in response && !('code' in response)) {
    return response as T;
  }

  // If wrapped in ApiResponse format
  if (typeof response === 'object' && response !== null && 'data' in response) {
    const apiResponse = response as ApiResponse<T>;
    // If data exists, return it
    if (apiResponse.data) {
      return apiResponse.data;
    }
    // If data is null/undefined, try to return the response itself if it has required fields
    if (typeof apiResponse === 'object' && 'id' in apiResponse) {
      return apiResponse as unknown as T;
    }
  }

  // If response is an object but doesn't match expected formats, try to return it anyway
  if (typeof response === 'object' && response !== null) {
    return response as T;
  }

  throw new Error(errorMessage);
}

export const notificationService = {
  /**
   * Get all notifications for the current user
   * GET /notifications
   * @param params - Optional query parameters (unreadOnly)
   */
  async getNotifications(params?: GetNotificationsParams): Promise<NotificationResponse[]> {
    const response = await axiosInstance.get('/notifications', { params });
    return normalizeToArray<NotificationResponse>(response.data);
  },

  /**
   * Mark a specific notification as read
   * POST /notifications/{id}
   * @param notificationId - The ID of the notification to mark as read
   */
  async markAsRead(notificationId: string): Promise<NotificationResponse> {
    const response = await axiosInstance.post(`/notifications/${notificationId}`);
    return normalizeToSingle<NotificationResponse>(response.data, 'Invalid response format from markAsRead API');
  },

  /**
   * Mark all notifications as read
   * POST /notifications/readAll
   */
  async markAllAsRead(): Promise<void> {
    await axiosInstance.post('/notifications/readAll');
  },

  /**
   * Get public notification (single or latest)
   * GET /notifications/public
   */
  async getPublicNotification(): Promise<NotificationResponse[]> {
    const response = await axiosInstance.get('/notifications/public');
    return normalizeToArray<NotificationResponse>(response.data);
  },

  /**
   * Get all public notifications
   * GET /notifications/public/list
   */
  async getPublicNotifications(): Promise<NotificationResponse[]> {
    const response = await axiosInstance.get('/notifications/public/list');
    return normalizeToArray<NotificationResponse>(response.data);
  },

  /**
   * Create a public notification
   * POST /notifications/public
   */
  async createPublicNotification(data: {
    type: string;
    message: string;
    receiverEmail?: string;
  }): Promise<NotificationResponse | string> {
    const response = await axiosInstance.post('/notifications/public', data);
    return response.data;
  }
};
