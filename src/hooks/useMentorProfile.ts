import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMentorProfileDetails, updateMentorProfileDetails } from "@/services/mentor-profile.service";
import { useToast } from "@/hooks/use-toast";
import type { UpdateMentorProfilePayload } from "@/types/mentor-profile.types";

export const useMentorProfile = () => {
  return useQuery({
    queryKey: ["mentor-profile-data"],
    queryFn: getMentorProfileDetails,
  });
};

export const useUpdateMentorProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: UpdateMentorProfilePayload) => updateMentorProfileDetails(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentor-profile-data"] });
      toast({
        title: "Profile Updated",
        description: "Your mentor profile has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    },
  });
};