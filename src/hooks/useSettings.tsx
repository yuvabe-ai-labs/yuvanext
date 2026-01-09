import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateNotificationSettings,
  deactivateAccount,
} from "@/services/settings.service";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { authClient } from "@/lib/auth-client"; // For signing out after deactivation

export const useUpdateNotifications = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: updateNotificationSettings,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Notification preferences updated.",
      });
      // Invalidate profile in case settings are returned there
      queryClient.invalidateQueries({ queryKey: ["unitProfile"] });
    },
    onError: (error: any) => {
      console.error("Update failed", error);
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
    onError: (error: any) => {
      console.error("Deactivation failed", error);
      toast({
        title: "Error",
        description: error.message || "Failed to deactivate account",
        variant: "destructive",
      });
    },
  });
};
