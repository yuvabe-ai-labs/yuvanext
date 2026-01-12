import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// 1. IMPORT HOOKS
import { useUpdateUnitProfile } from "@/hooks/useUnitProfile";
import { useUploadImage } from "@/hooks/useUnitProfile";
import { ImageType } from "@/types/profile.types"; // Using shared type

type EntityType = "student" | "unit";

interface ImageUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentImageUrl?: string | null;
  userId: string;
  userName: string;
  imageType: ImageType;
  entityType: EntityType;
  onSuccess: (imageUrl: string) => void;
}

export const ImageUploadDialog = ({
  isOpen,
  onClose,
  currentImageUrl,
  userId,
  userName,
  imageType,
  entityType,
  onSuccess,
}: ImageUploadDialogProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImageUrl || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // 2. USE REACT QUERY MUTATIONS
  const uploadImageMutation = useUploadImage();
  const updateProfileMutation = useUpdateUnitProfile();

  // Combined loading state
  const isProcessing =
    uploadImageMutation.isPending || updateProfileMutation.isPending;

  const maxSize = imageType === "avatar" ? 2097152 : 5242880; // 2MB or 5MB
  const aspectRatio = imageType === "avatar" ? "1:1" : "16:9";

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `Please select an image under ${maxSize / 1048576}MB`,
        variant: "destructive",
      });
      return;
    }

    if (
      ![
        "image/png",
        "image/jpg",
        "image/jpeg",
        "image/gif",
        "image/webp",
      ].includes(file.type)
    ) {
      toast({
        title: "Invalid file type",
        description: "Please select a PNG, JPG, JPEG, GIF, or WEBP image",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    try {
      // Step 1: Upload Image (POST /api/upload)
      const uploadResponse = await uploadImageMutation.mutateAsync({
        file,
        type: imageType,
        userId,
      });

      const publicUrl = uploadResponse.url;

      // Step 2: Update Profile with URL (PUT /api/profile via hooks)
      const updatePayload =
        imageType === "avatar"
          ? { avatarUrl: publicUrl }
          : { bannerUrl: publicUrl };

      await updateProfileMutation.mutateAsync(updatePayload);

      toast({
        title: "Success",
        description: `${
          imageType === "avatar" ? "Profile photo" : "Banner image"
        } updated successfully`,
      });

      onSuccess(publicUrl);
      onClose();
    } catch (error) {
      console.error(`Error uploading ${imageType}:`, error);
      // Errors are handled by the hooks/service usually, but we keep this fallback
      toast({
        title: "Upload failed",
        description: error.message || `Failed to upload ${imageType}`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      // Step 1: Update Profile to remove URL
      const updatePayload =
        imageType === "avatar" ? { avatarUrl: null } : { bannerUrl: null };

      await updateProfileMutation.mutateAsync(updatePayload);

      setPreviewUrl(null); // Clear local preview

      toast({
        title: "Success",
        description: `${
          imageType === "avatar" ? "Profile photo" : "Banner image"
        } deleted successfully`,
      });

      onSuccess("");
      onClose();
    } catch (error) {
      console.error(`Error deleting ${imageType}:`, error);
      toast({
        title: "Delete failed",
        description: `Failed to delete ${imageType}`,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {imageType === "avatar"
              ? "Profile photo upload"
              : "Banner image upload"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 py-6">
          <div className="relative group w-full">
            {imageType === "avatar" ? (
              <div className="w-40 h-40 mx-auto rounded-full overflow-hidden bg-muted flex items-center justify-center">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl text-muted-foreground">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                )}
                <div
                  className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
            ) : (
              <div
                className={cn(
                  "w-full rounded-lg overflow-hidden bg-muted flex items-center justify-center",
                  "aspect-[16/9]"
                )}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-16 h-16 text-muted-foreground" />
                )}
                <div
                  className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-8 h-8 text-white" />
                  <span className="text-white text-sm ml-2">Replace image</span>
                </div>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpg,image/jpeg,image/gif,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              or{" "}
              <button
                onClick={handleDelete}
                disabled={!currentImageUrl || isProcessing}
                className="text-destructive hover:underline disabled:opacity-50"
              >
                Delete
              </button>
            </p>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Supported formats: PNG, JPG, JPEG, GIF, WEBP - up to{" "}
            {maxSize / 1048576}MB
            <br />
            Recommended aspect ratio: {aspectRatio}
          </p>

          <div className="flex gap-4 w-full">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isProcessing || !fileInputRef.current?.files?.[0]}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
