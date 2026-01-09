import axiosInstance from "@/config/platform-api";
import type {
  NotificationsData,
  DeleteAllNotificationsResponse,
  MarkNotificationReadResponse,
  MarkAllNotificationsReadResponse,
} from "@/types/notification.types";
import { handleApiResponse, handleApiError } from "@/lib/api-handler";

// Fetch notifications

export const getNotifications = async (): Promise<NotificationsData> => {
  try {
    const response = await axiosInstance.get("/notifications");

    return handleApiResponse<NotificationsData>(response, {
      notifications: [],
      total: 0,
      unreadCount: 0,
    });
  } catch (error) {
    return handleApiError(error, "Failed to fetch notifications");
  }
};

// Delete all notifications

export const deleteNotifications =
  async (): Promise<DeleteAllNotificationsResponse> => {
    try {
      const response = await axiosInstance.delete("/notifications");

      return handleApiResponse<DeleteAllNotificationsResponse>(response, {
        deletedCount: 0,
      });
    } catch (error) {
      return handleApiError(error, "Failed to delete notifications");
    }
  };

/** Mark single notification as read */
export const markNotificationAsRead = async (
  notificationId: string
): Promise<MarkNotificationReadResponse> => {
  try {
    const response = await axiosInstance.put(
      `/notifications/${notificationId}/mark-read`
    );

    return handleApiResponse<MarkNotificationReadResponse>(
      response,
      {} as MarkNotificationReadResponse
    );
  } catch (error) {
    return handleApiError(error, "Failed to mark notification as read");
  }
};

/** Mark all notifications as read */
export const markAllNotificationsAsRead =
  async (): Promise<MarkAllNotificationsReadResponse> => {
    try {
      const response = await axiosInstance.put("/notifications/mark-all-read");

      return handleApiResponse<MarkAllNotificationsReadResponse>(response, {
        updatedCount: 0,
      });
    } catch (error) {
      return handleApiError(error, "Failed to mark all notifications as read");
    }
  };

/** Delete single notification */
export const deleteNotification = async (
  notificationId: string
): Promise<void> => {
  try {
    await axiosInstance.delete(`/notifications/${notificationId}`);
  } catch (error) {
    return handleApiError(error, "Failed to delete notification");
  }
};
