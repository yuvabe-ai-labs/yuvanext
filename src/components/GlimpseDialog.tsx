import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, Loader2, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// 1. Import the specific operations hook
import { useTestimonialOperations } from "@/hooks/useUnitProfile";

interface GlimpseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentGlimpseUrl: string | null;
  onSuccess: () => void;
}

export const GlimpseDialog = ({
  isOpen,
  onClose,
  userId,
  currentGlimpseUrl,
  onSuccess,
}: GlimpseDialogProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // 2. Use the specialized hook for Testimonials
  const { uploadTestimonial, deleteTestimonial } = useTestimonialOperations();

  // Combined loading state
  const isProcessing =
    uploadTestimonial.isPending || deleteTestimonial.isPending;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("video/")) {
        toast({
          title: "Invalid file type",
          description: "Please select a valid video file.",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a video smaller than 50MB.",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      // 3. Use the new mutation (POST /api/profile/testimonial)
      await uploadTestimonial.mutateAsync(selectedFile);

      // Note: The hook invalidates the query, so the UI updates automatically
      setSelectedFile(null);
      setPreviewUrl(null);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Upload failed", error);
      // Toast is handled by the hook, but extra logging is fine
    }
  };

  const handleDelete = async () => {
    if (!currentGlimpseUrl) return;

    try {
      // 4. Use the new mutation (DELETE /api/profile/testimonial)
      await deleteTestimonial.mutateAsync(currentGlimpseUrl);

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setSelectedFile(null);
      setPreviewUrl(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Glimpse of the Unit</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Video Preview Area */}
          {(previewUrl || currentGlimpseUrl) && (
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-gray-200">
              <video
                src={previewUrl || currentGlimpseUrl || ""}
                controls
                className="w-full h-full"
              >
                Your browser does not support the video tag.
              </video>

              {/* Delete button only shows for existing server URL, not new local preview */}
              {!previewUrl && currentGlimpseUrl && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isProcessing}
                  className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full disabled:opacity-50 transition-colors"
                  title="Remove Video"
                >
                  {deleteTestimonial.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          )}

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors ${
              isProcessing
                ? "opacity-50 pointer-events-none"
                : "hover:bg-gray-50"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="video/mp4,video/webm,video/quicktime"
              className="hidden"
            />
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">
              {selectedFile ? selectedFile.name : "Upload a glimpse video"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Video should be less than 50MB. Supported formats: MP4, WebM, MOV
            </p>
            <Button
              type="button"
              variant={selectedFile ? "outline" : "default"}
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
            >
              {selectedFile ? "Change Video" : "Choose Video"}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          {selectedFile && (
            <Button onClick={handleUpload} disabled={isProcessing}>
              {uploadTestimonial.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Save & Upload"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
