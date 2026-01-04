import { useState, useEffect } from "react";
import axiosInstance from "@/config/platform-api";
import { useToast } from "@/hooks/use-toast";

export interface NotificationPreferences {
  id?: string;
  user_id?: string;
  allow_all: boolean;
  application_status_in_app: boolean;
  application_status_email: boolean;
}

export function useNotificationPreferences() {
  const { toast } = useToast();
  const [preferences, setPreferences] =
    useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);

      // Assumption: GET /api/notification-preferences or /api/profile/notification-preferences
      // Backend should return preferences for authenticated user
      const { data } = await axiosInstance.get("/notification-preferences");

      const prefs = data?.data || data;
      if (prefs) {
        setPreferences(prefs);
      } else {
        // If no preferences exist, create default ones
        const defaultPrefs: NotificationPreferences = {
          allow_all: true,
          application_status_in_app: true,
          application_status_email: true,
        };
        setPreferences(defaultPrefs);
      }
    } catch (err: any) {
      // If 404, create default preferences
      if (err.response?.status === 404) {
        const defaultPrefs: NotificationPreferences = {
          allow_all: true,
          application_status_in_app: true,
          application_status_email: true,
        };
        setPreferences(defaultPrefs);
      } else {
        console.error(err);
        toast({
          title: "Error",
          description: "Failed to load notification preferences",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (
    updates: Partial<NotificationPreferences>
  ) => {
    try {
      // Assumption: PUT /api/notification-preferences
      const { data } = await axiosInstance.put("/notification-preferences", updates);

      const updatedPrefs = data?.data || data;
      if (updatedPrefs) {
        setPreferences(updatedPrefs);
      } else {
        setPreferences({ ...preferences, ...updates } as NotificationPreferences);
      }
      return updatedPrefs || preferences;
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive",
      });
      throw err;
    }
  };

  return {
    preferences,
    loading,
    updatePreferences,
    refetch: fetchPreferences,
  };
}
