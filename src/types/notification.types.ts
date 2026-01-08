export type NotificationType = "success" | "error" | "info" | "warning";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsData {
  notifications: Notification[];
  total: number;
  unreadCount: number;
}
