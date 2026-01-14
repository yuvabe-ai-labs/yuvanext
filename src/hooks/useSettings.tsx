import { useNavigate } from "react-router-dom";
import { authClient } from "@/lib/auth-client"; // For signing out after deactivation
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotificationSettings,
  updateNotificationSettings,
  deactivateAccount,
} from "@/services/settings.service";
import { useToast } from "@/hooks/use-toast";
import type { NotificationSettings } from "@/types/settings.types";

// Hook to FETCH settings
export const useNotificationSettings = () => {
  return useQuery({
    queryKey: ["notificationSettings"],
    queryFn: getNotificationSettings,
    staleTime: 1000 * 60 * 5, // Cache for 5 mins
  });
};

// Hook to UPDATE settings
export const useUpdateNotifications = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: NotificationSettings) =>
      updateNotificationSettings(payload),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Notification preferences updated.",
      });
      // Invalidate the specific settings query, NOT the profile query
      queryClient.invalidateQueries({ queryKey: ["notificationSettings"] });
    },
    onError: (error) => {
      console.error("Update failed", error);
      toast({
        title: "Error",
        description: "Failed to update settings.",
        variant: "destructive",
      });
    },
  });
};

export const useDeactivateAccount = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: deactivateAccount,
    onSuccess: async () => {
      toast({
        title: "Account Deactivated",
        description: "You have been logged out.",
      });
      // Sign out from client side session
      await authClient.signOut();
      navigate("/login");
    },
    onError: (error) => {
      console.error("Deactivation failed", error);
      toast({
        title: "Error",
        description: error.message || "Failed to deactivate account",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteAccount = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const { error } = await authClient.deleteUser();
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Account Deleted",
        description: "We are sorry to see you go.",
      });
      navigate("/");
    },
    onError: (error) => {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete account.",
        variant: "destructive",
      });
    },
  });
};
