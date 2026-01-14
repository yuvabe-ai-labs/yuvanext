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
import { useGalleryOperations } from "@/hooks/useUnitProfile";

interface GalleryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentImages: string[];
  onSuccess: () => void;
}

export const GalleryDialog = ({
  isOpen,
  onClose,
  userId,
  currentImages,
  onSuccess,
}: GalleryDialogProps) => {
  // UI State
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [viewImage, setViewImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Logic Hook
  const { uploadImages, deleteImage, isProcessing } = useGalleryOperations(
    currentImages,
    userId
  );

  const maxFileSize = 5242880; // 5MB
  const maxFiles = 10;

  // --- Handlers ---

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (files.length + currentImages.length + selectedFiles.length > maxFiles) {
      toast({
        title: "Limit Exceeded",
        description: `You can only have up to ${maxFiles} images.`,
        variant: "destructive",
      });
      return;
    }

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    files.forEach((file) => {
      if (file.size > maxFileSize) {
        toast({
          title: "File too large",
          description: `${file.name} > 5MB`,
          variant: "destructive",
        });
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid File",
          description: `${file.name} is not an image`,
          variant: "destructive",
        });
        return;
      }

      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    await uploadImages.mutateAsync(selectedFiles);

    // Cleanup on success
    setSelectedFiles([]);
    setPreviewUrls([]);
    onSuccess();
    onClose();
  };

  const handleDelete = async (imageUrl: string) => {
    await deleteImage.mutateAsync(imageUrl);
    onSuccess();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Gallery Management</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* 1. Existing Gallery Grid */}
            {currentImages.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3">
                  Current Images ({currentImages.length}/{maxFiles})
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {currentImages.map((imageUrl, index) => (
                    <div
                      key={index}
                      className="relative group aspect-square rounded-lg overflow-hidden border bg-gray-100"
                    >
                      <img
                        src={imageUrl}
                        alt={`Gallery ${index}`}
                        className="w-full h-full object-cover"
                      />

                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => setViewImage(imageUrl)}
                          className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                        >
                          <ZoomIn className="w-4 h-4 text-gray-800" />
                        </button>
                        <button
                          onClick={() => handleDelete(imageUrl)}
                          disabled={isProcessing}
                          className="p-2 bg-red-500/90 text-white rounded-full hover:bg-red-500 disabled:opacity-50 transition-colors"
                        >
                          {deleteImage.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Upload Section */}
            {currentImages.length < maxFiles && (
              <div>
                <h3 className="text-sm font-semibold mb-3">
                  Upload New Images
                </h3>

                <div
                  onClick={() => !isProcessing && fileInputRef.current?.click()}
                  className={`border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center transition-colors ${
                    isProcessing
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer hover:border-primary hover:bg-gray-50"
                  }`}
                >
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, WEBP - Max 5MB
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isProcessing}
                />

                {/* 3. Preview Staged Files */}
                {selectedFiles.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">
                      Selected ({selectedFiles.length})
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      {previewUrls.map((url, index) => (
                        <div
                          key={index}
                          className="relative group aspect-square rounded-lg overflow-hidden border"
                        >
                          <img
                            src={url}
                            alt="Preview"
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

            {/* 4. Footer Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isProcessing}
                className="flex-1"
              >
                Cancel
              </Button>
              {selectedFiles.length > 0 && (
                <Button
                  onClick={handleUpload}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {uploadImages.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Uploading...
                    </>
                  ) : (
                    `Upload ${selectedFiles.length} Images`
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Viewer Overlay */}
      <Dialog open={!!viewImage} onOpenChange={() => setViewImage(null)}>
        <DialogContent className="sm:max-w-4xl bg-transparent border-none shadow-none p-0">
          <div className="relative flex justify-center items-center h-full">
            <img
              src={viewImage || ""}
              alt="Full view"
              className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
            />
            <button
              onClick={() => setViewImage(null)}
              className="absolute -top-10 right-0 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
