import axiosInstance from "@/config/platform-api";
import type { NotificationsData } from "@/types/notification.types";
import { handleApiResponse, handleApiError } from "@/lib/api-handler";
import { DeleteAllNotificationsResponse } from "@/types/chatbot.types";

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
