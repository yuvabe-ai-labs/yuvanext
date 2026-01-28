import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AvatarUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl?: string | null;
  userId: string;
  userName: string;
  onSuccess: (avatarUrl: string) => void;
}

export const AvatarUploadDialog = ({
  isOpen,
  onClose,
  currentAvatarUrl,
  userId,
  userName,
  onSuccess,
}: AvatarUploadDialogProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (2MB = 2097152 bytes)
    if (file.size > 2097152) {
      toast({
        title: "File too large",
        description: "Please select an image under 2MB",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    if (!["image/png", "image/jpg", "image/jpeg", "image/gif"].includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select a PNG, JPG, JPEG, or GIF image",
        variant: "destructive",
      });
      return;
    }

    // Create preview
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
      setUploading(true);

      // Get current auth user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Delete old avatar if exists
      if (currentAvatarUrl) {
        const oldPath = currentAvatarUrl.split("/").pop();
        if (oldPath) {
          await supabase.storage.from("avatars").remove([`${user.id}/${oldPath}`]);
        }
      }

      // Upload new avatar using auth user ID for folder structure
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // Update student profile
      const { error: updateError } = await supabase
        .from("student_profiles")
        .update({ avatar_url: publicUrl })
        .eq("profile_id", userId);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Profile photo updated successfully",
      });

      onSuccess(publicUrl);
      onClose();
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload profile photo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentAvatarUrl) return;

    try {
      setUploading(true);

      // Get current auth user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Delete from storage using auth user ID
      const oldPath = currentAvatarUrl.split("/").pop();
      if (oldPath) {
        await supabase.storage.from("avatars").remove([`${user.id}/${oldPath}`]);
      }

      // Update student profile
      const { error } = await supabase.from("student_profiles").update({ avatar_url: null }).eq("profile_id", userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile photo deleted successfully",
      });

      onSuccess("");
      onClose();
    } catch (error: any) {
      console.error("Error deleting avatar:", error);
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete profile photo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Profile photo upload</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 py-6">
          <div className="relative group">
            <Avatar className="h-40 w-40">
              <AvatarImage src={previewUrl || ""} />
              <AvatarFallback className="text-4xl">{userName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div
              className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="w-8 h-8 text-white" />
              <span className="text-white text-sm ml-2">Replace photo</span>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpg,image/jpeg,image/gif"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              or{" "}
              <button
                onClick={handleDelete}
                disabled={!currentAvatarUrl || uploading}
                className="text-destructive hover:underline disabled:opacity-50"
              >
                Delete
              </button>
            </p>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Supported file format: png, jpg, jpeg, gif - upto 2MB
          </p>

          <div className="flex gap-4 w-full">
            <Button variant="outline" onClick={onClose} disabled={uploading} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploading || !fileInputRef.current?.files?.[0]}
              className="flex-1 bg-primary"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
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