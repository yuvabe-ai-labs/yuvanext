import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { uploadAvatar, deleteAvatar } from "@/services/profile.service"; 

export const useMentorAvatarOperations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: () => {
      toast({ title: "Success", description: "Profile photo updated!" });
      queryClient.invalidateQueries({ queryKey: ["mentor-profile-data"] }); 
    },
    onError: () =>
      toast({ title: "Error", description: "Failed to upload photo", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAvatar,
    onSuccess: () => {
      toast({ title: "Success", description: "Photo removed" });
      queryClient.invalidateQueries({ queryKey: ["mentor-profile-data"] });
    },
  });

  return { uploadAvatar: uploadMutation, deleteAvatar: deleteMutation };
};