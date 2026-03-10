import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { uploadBanner, deleteBanner } from "@/services/profile.service"; 

export const useMentorBannerOperations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: uploadBanner,
    onSuccess: () => {
      toast({ title: "Success", description: "Banner image updated!" });
      queryClient.invalidateQueries({ queryKey: ["mentor-profile-data"] }); 
    },
    onError: () =>
      toast({ title: "Error", description: "Failed to upload banner", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBanner,
    onSuccess: () => {
      toast({ title: "Success", description: "Banner image removed" });
      queryClient.invalidateQueries({ queryKey: ["mentor-profile-data"] });
    },
    onError: () =>
      toast({ title: "Error", description: "Failed to delete banner", variant: "destructive" }),
  });

  return { uploadBanner: uploadMutation, deleteBanner: deleteMutation };
};