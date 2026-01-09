import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, X, ZoomIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axiosInstance from "@/config/platform-api"; // Import Axios
import { useUpdateUnitProfile } from "@/hooks/useUnitProfile"; // Import mutation hook

interface GalleryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentImages: string[];
  onSuccess: () => void; // This triggers refetch in parent
}

export const GalleryDialog = ({
  isOpen,
  onClose,
  userId,
  currentImages,
  onSuccess,
}: GalleryDialogProps) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Use the mutation hook to update the profile data after upload
  const updateProfileMutation = useUpdateUnitProfile();

  const maxFileSize = 5242880; // 5MB
  const maxFiles = 10;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (files.length + currentImages.length > maxFiles) {
      toast({
        title: "Too many images",
        description: `You can only have up to ${maxFiles} images in your gallery`,
        variant: "destructive",
      });
      return;
    }

    const validFiles: File[] = [];
    const newPreviewUrls: string[] = [];

    files.forEach((file) => {
      if (file.size > maxFileSize) {
        toast({
          title: "File too large",
          description: `${file.name} is too large. Max size is 5MB`,
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
          description: `${file.name} is not a supported image format`,
          variant: "destructive",
        });
        return;
      }

      validFiles.push(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviewUrls.push(reader.result as string);
        if (newPreviewUrls.length === validFiles.length) {
          setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
        }
      };
      reader.readAsDataURL(file);
    });

    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      setUploading(true);
      const uploadedUrls: string[] = [];

      // Upload each file to the backend
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "gallery");
        formData.append("userId", userId);

        // POST /api/upload (Backend handles storage logic)
        const response = await axiosInstance.put("/profile", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.data.url) {
          uploadedUrls.push(response.data.url);
        }
      }

      // Update galleryImages in profile via API
      const newGalleryImages = [...currentImages, ...uploadedUrls];

      // Use the mutation hook to update the profile
      await updateProfileMutation.mutateAsync({
        galleryImages: newGalleryImages,
      });

      setSelectedFiles([]);
      setPreviewUrls([]);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error uploading gallery images:", error);
      toast({
        title: "Upload failed",
        description: error.response?.data?.message || "Failed to upload images",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteExisting = async (
    imageUrl: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();

    try {
      setUploading(true);

      // Call Backend to delete file (Optional, strictly speaking we just need to unlink it from profile)
      // await axiosInstance.delete("/upload", { data: { url: imageUrl } });

      // Update database list
      const newGalleryImages = currentImages.filter((img) => img !== imageUrl);

      await updateProfileMutation.mutateAsync({
        galleryImages: newGalleryImages,
      });

      toast({ title: "Success", description: "Image deleted successfully" });
      onSuccess();
    } catch (error: any) {
      console.error("Error deleting gallery image:", error);
      toast({
        title: "Delete failed",
        description: "Failed to delete image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Gallery Management</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Current Gallery Images */}
            {currentImages.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3">
                  Current Images ({currentImages.length}/{maxFiles})
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {currentImages.map((imageUrl, index) => (
                    <div
                      key={index}
                      className="relative group aspect-square rounded-lg overflow-hidden border"
                    >
                      <img
                        src={imageUrl}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => setViewImage(imageUrl)}
                          className="p-2 bg-white/90 rounded-full hover:bg-white"
                        >
                          <ZoomIn className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteExisting(imageUrl, e)}
                          disabled={uploading}
                          className="p-2 bg-red-500/90 text-white rounded-full hover:bg-red-500 disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload New Images */}
            {currentImages.length < maxFiles && (
              <div>
                <h3 className="text-sm font-semibold mb-3">
                  Upload New Images
                </h3>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                >
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, JPEG, GIF, WEBP - up to 5MB each
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Max {maxFiles - currentImages.length} more images
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpg,image/jpeg,image/gif,image/webp"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Preview Selected Files */}
                {selectedFiles.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">
                      Selected Files ({selectedFiles.length})
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      {previewUrls.map((url, index) => (
                        <div
                          key={index}
                          className="relative group aspect-square rounded-lg overflow-hidden border"
                        >
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => removeSelectedFile(index)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={uploading}
                className="flex-1"
              >
                Cancel
              </Button>
              {selectedFiles.length > 0 && (
                <Button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    `Upload ${selectedFiles.length} Image${
                      selectedFiles.length > 1 ? "s" : ""
                    }`
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Viewer Dialog */}
      <Dialog open={!!viewImage} onOpenChange={() => setViewImage(null)}>
        <DialogContent className="sm:max-w-4xl">
          {/* Same as your code */}
          <div className="relative">
            <img
              src={viewImage || ""}
              alt="Full size preview"
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            <button
              onClick={() => setViewImage(null)}
              className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
