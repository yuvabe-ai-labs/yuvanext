import axiosInstance from "@/config/platform-api";
import { handleApiResponse, handleApiError } from "@/lib/api-handler";
import type {
  NotificationSettingsPayload,
  DeactivateAccountResponse,
} from "@/types/settings.types";

// Update Notification Preferences
export const updateNotificationSettings = async (
  payload: NotificationSettingsPayload
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
