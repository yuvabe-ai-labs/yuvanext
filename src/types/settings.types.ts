export interface NotificationSettingsPayload {
  emailNotificationsEnabled: boolean;
  inAppNotificationsEnabled: boolean;
}

export interface DeactivateAccountResponse {
  message: string;
  // status_code: number;
}
