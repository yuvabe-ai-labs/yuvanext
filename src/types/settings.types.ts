export interface DeactivateAccountResponse {
  message: string;
  // status_code: number;
}

// Define what the backend expects/returns
export interface NotificationSettings {
  emailNotificationsEnabled: boolean;
  inAppNotificationsEnabled: boolean;
}

export interface NotificationSettingsResponse {
  status_code: number;
  message: string;
  data?: NotificationSettings;
}
