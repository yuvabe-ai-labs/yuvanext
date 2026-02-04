import { useState, useEffect } from "react";
import axiosInstance from "@/config/platform-api";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning";
  is_read: boolean;
  related_id: string | null;
  created_at: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);

      // GET /api/notifications (from provided endpoints)
      const { data } = await axiosInstance.get("/notifications");

      const typedData = (
        Array.isArray(data) ? data : data.notifications || []
      ).map((n: any) => ({
        ...n,
        type: n.type as "info" | "success" | "warning",
      }));

      setNotifications(typedData);
      setUnreadCount(typedData.filter((n) => !n.is_read).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // PUT /api/notifications/{id}/mark-read (from provided endpoints)
      await axiosInstance.put(`/notifications/${notificationId}/mark-read`);

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // PUT /api/notifications/mark-all-read (from provided endpoints)
      await axiosInstance.put("/notifications/mark-all-read");

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      // DEL /api/notifications/{id} (from provided endpoints)
      await axiosInstance.delete(`/notifications/${notificationId}`);

      const deletedNotification = notifications.find(
        (n) => n.id === notificationId
      );
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Note: Real-time subscriptions would need to be handled via WebSockets or polling
    // if the backend supports it. For now, we'll rely on manual refetch.
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications,
  };
};
