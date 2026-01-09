import axiosInstance from "@/config/platform-api";
import { handleApiResponse, handleApiError } from "@/lib/api-handler";
import type {
  NotificationSettings,
  DeactivateAccountResponse,
} from "@/types/settings.types";

// Deactivate Account
export const deactivateAccount =
  async (): Promise<DeactivateAccountResponse> => {
    try {
      const response = await axiosInstance.post("/settings/account-deactivate");
      return handleApiResponse(response, { message: "Account deactivated" });
    } catch (error) {
      return handleApiError(error, "Failed to deactivate account");
    }
  };

// FETCH settings
export const getNotificationSettings =
  async (): Promise<NotificationSettings> => {
    try {
      const response = await axiosInstance.get("/settings/notifications");
      // Assuming API structure: { data: { emailNotificationsEnabled: true, ... } }
      // Adjust if handleApiResponse expects just response.data
      return handleApiResponse<NotificationSettings>(response, {
        emailNotificationsEnabled: false,
        inAppNotificationsEnabled: false,
      });
    } catch (error) {
      return handleApiError(error, "Failed to fetch notification settings");
    }
  };

// UPDATE settings
export const updateNotificationSettings = async (
  payload: NotificationSettings
): Promise<any> => {
  try {
    const response = await axiosInstance.patch(
      "/settings/notifications",
      payload
    );
    return handleApiResponse(response, {});
  } catch (error) {
    return handleApiError(error, "Failed to update notification settings");
  }
};
