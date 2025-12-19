import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) return;

      setUserId(user.id);

      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          const { data: created } = await supabase
            .from("notification_preferences")
            .insert({ user_id: user.id })
            .select()
            .single();

          setPreferences(created);
        } else {
          throw error;
        }
      } else {
        setPreferences(data);
      }
    } catch (err) {
      console.error(err);
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

    const { data, error } = await supabase
      .from("notification_preferences")
      .update(updates)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive",
      });
      throw error;
    }

    setPreferences(data);
    return data;
  };

  return {
    preferences,
    loading,
    updatePreferences,
    refetch: fetchPreferences,
  };
}
