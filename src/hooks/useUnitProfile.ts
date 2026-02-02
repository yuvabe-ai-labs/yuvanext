import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Profile } from "@/types/profiles.types";
import axiosInstance from "@/config/platform-api"; // Make sure this path is correct
import {
  getUnitProfile,
  updateUnitProfile,
  uploadAvatar,
  deleteAvatar,
  uploadBanner,
  deleteBanner,
  uploadTestimonial,
  deleteTestimonial,
  uploadGalleryImage,
} from "@/services/profile.service";

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
    mutationFn: (updates: Partial<Profile>) => updateUnitProfile(updates),

    onSuccess: () => {
      toast({ title: "Success", description: "Profile updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["unitProfile"] });
    },

    onError: (error) => {
      console.error("Update failed:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    },
  });
};

// --- Avatar Hooks ---
export const useAvatarOperations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: () => {
      toast({ title: "Success", description: "Avatar updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["unitProfile"] });
    },
    onError: () =>
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive",
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAvatar,
    onSuccess: () => {
      toast({ title: "Success", description: "Avatar removed" });
      queryClient.invalidateQueries({ queryKey: ["unitProfile"] });
    },
    onError: () =>
      toast({
        title: "Error",
        description: "Failed to remove avatar",
        variant: "destructive",
      }),
  });

  return { uploadAvatar: uploadMutation, deleteAvatar: deleteMutation };
};

// --- Banner Hooks ---
export const useBannerOperations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: uploadBanner,
    onSuccess: () => {
      toast({ title: "Success", description: "Banner updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["unitProfile"] });
    },
    onError: () =>
      toast({
        title: "Error",
        description: "Failed to upload banner",
        variant: "destructive",
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBanner,
    onSuccess: () => {
      toast({ title: "Success", description: "Banner removed" });
      queryClient.invalidateQueries({ queryKey: ["unitProfile"] });
    },
    onError: () =>
      toast({
        title: "Error",
        description: "Failed to remove banner",
        variant: "destructive",
      }),
  });

  return { uploadBanner: uploadMutation, deleteBanner: deleteMutation };
};

// --- Gallery Hooks (The Complex Version for Multi-Upload) ---
export const useGalleryOperations = (
  currentImages: string[],
  userId: string
) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const updateProfileMutation = useUpdateUnitProfile();

  // 1. Upload Mutation (Handles multiple files)
  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const response = await uploadGalleryImage(file);
        if (response?.galleryImages && response.galleryImages.length > 0) {
          uploadedUrls.push(response.galleryImages[0]);
        }
      }

      const newGalleryImages = [...currentImages, ...uploadedUrls];
      return newGalleryImages;
    },
    onSuccess: () => {
      // Toast handled by updateProfileMutation, but we invalidate here too to be safe
      queryClient.invalidateQueries({ queryKey: ["unitProfile"] });
    },
    onError: (error) => {
      console.error("Gallery upload failed", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload images",
        variant: "destructive",
      });
    },
  });

  // 2. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      // Filter out the image locally
      const newGalleryImages = currentImages.filter((img) => img !== imageUrl);

      // Update the profile with the new array
      await updateProfileMutation.mutateAsync({
        galleryImages: newGalleryImages,
      });
    },
    onSuccess: () => {
      // Toast handled by updateProfileMutation
      queryClient.invalidateQueries({ queryKey: ["unitProfile"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    },
  });

  return {
    uploadImages: uploadMutation,
    deleteImage: deleteMutation,
    isProcessing: uploadMutation.isPending || deleteMutation.isPending,
  };
};

// --- Testimonial/Video Hooks ---
export const useTestimonialOperations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: uploadTestimonial,
    onSuccess: () => {
      toast({ title: "Success", description: "Video uploaded successfully" });
      queryClient.invalidateQueries({ queryKey: ["unitProfile"] });
    },
    onError: () =>
      toast({
        title: "Error",
        description: "Failed to upload video",
        variant: "destructive",
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTestimonial,
    onSuccess: () => {
      toast({ title: "Success", description: "Video removed" });
      queryClient.invalidateQueries({ queryKey: ["unitProfile"] });
    },
    onError: () =>
      toast({
        title: "Error",
        description: "Failed to delete video",
        variant: "destructive",
      }),
  });

  return {
    uploadTestimonial: uploadMutation,
    deleteTestimonial: deleteMutation,
  };
};
