import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUnitProfile, updateUnitProfile } from "@/services/profile.service";
import { useToast } from "@/hooks/use-toast";
import type { Profile } from "@/types/profile.types";

// --- Main Query Hook ---
export const useUnitProfile = () => {
  return useQuery({
    queryKey: ["unitProfile"],
    queryFn: getUnitProfile,
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
    retry: 1,
  });
};

import { getUserProfile } from "@/services/profile.service"; // Updated import path
import { authClient } from "@/lib/auth-client";

export const useUserProfile = () => {
  // We use the session to control the 'enabled' state of the query
  const { data: session } = authClient.useSession();
  const user = session?.user;

  return useQuery({
    queryKey: ["userProfile", user?.id], // Cache key unique to the logged-in user
    queryFn: getUserProfile,
    enabled: !!user, // Only run the fetch if a user is logged in
    staleTime: 1000 * 60 * 5, // Cache the profile data for 5 minutes
    retry: 1, // Only retry once if it fails
  });
};

// --- Mutation Hook for Updates ---
export const useUpdateUnitProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: updateUnitProfile,
    onMutate: async (newProfileData) => {
      // OPTIONAL: Optimistic Update
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["unitProfile"] });

      // Snapshot previous value
      const previousProfile = queryClient.getQueryData<Profile>([
        "unitProfile",
      ]);

      // Optimistically update to new value
      if (previousProfile) {
        queryClient.setQueryData<Profile>(["unitProfile"], {
          ...previousProfile,
          ...newProfileData,
        });
      }

      return { previousProfile };
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Profile updated successfully" });
      // Invalidate to refetch fresh data from server
      queryClient.invalidateQueries({ queryKey: ["unitProfile"] });
    },
    onError: (err, newProfile, context) => {
      // Rollback on error
      if (context?.previousProfile) {
        queryClient.setQueryData(["unitProfile"], context.previousProfile);
      }
      console.error("Update failed:", err);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    },
  });
};
