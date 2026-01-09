import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUnitProfile, updateUnitProfile } from "@/services/profile.service";
import { useToast } from "@/hooks/use-toast";
import type { Profile } from "@/types/profile.types";
import { uploadImage } from "@/services/profile.service";
import type { UploadImagePayload } from "@/types/profile.types";

// --- Main Query Hook ---
export const useUnitProfile = () => {
  return useQuery({
    queryKey: ["unitProfile"],
    queryFn: getUnitProfile,
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
    retry: 1,
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

export const useUploadImage = () => {
  return useMutation({
    mutationFn: (payload: UploadImagePayload) => uploadImage(payload),
  });
};
