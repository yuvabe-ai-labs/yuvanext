import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface NotificationPreferences {
  id?: string;
  user_id?: string;
  allow_all: boolean;
  application_status_in_app: boolean;
  application_status_email: boolean;
  internship_updates_in_app: boolean;
  internship_updates_email: boolean;
  recommended_internship_in_app: boolean;
  recommended_internship_email: boolean;
  similar_internships_in_app: boolean;
  similar_internships_email: boolean;
  recommended_courses_in_app: boolean;
  recommended_courses_email: boolean;
}

export function useNotificationPreferences() {
  const { toast } = useToast();
  const [preferences, setPreferences] =
    useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) {
        setLoading(false);
        return;
      }

      setUserId(user.id);

      // Fetch preferences
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        // If no preferences exist, create default ones
        if (error.code === "PGRST116") {
          const { data: newPrefs, error: createError } = await supabase
            .from("notification_preferences")
            .insert({ user_id: user.id })
            .select()
            .single();

          if (createError) throw createError;
          setPreferences(newPrefs);
        } else {
          throw error;
        }
      } else {
        setPreferences(data);
      }
    } catch (error: any) {
      console.error("Error fetching notification preferences:", error);
      toast({
        title: "Error",
        description: "Failed to load notification preferences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (
    updates: Partial<NotificationPreferences>
  ) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .update(updates)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;

      setPreferences(data);

      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved",
      });

      return data;
    } catch (error: any) {
      console.error("Error updating notification preferences:", error);
      toast({
        title: "Error",
        description: "Failed to update notification preferences",
        variant: "destructive",
      });
      throw error;
    }
  };

  const togglePreference = async (key: keyof NotificationPreferences) => {
    if (!preferences) return;

    const newValue = !preferences[key];
    await updatePreferences({ [key]: newValue });
  };

  return {
    preferences,
    loading,
    updatePreferences,
    togglePreference,
    refetch: fetchPreferences,
  };
}
