import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import AIIcon from "../ui/custom-icons";
import { useUpdateProfile } from "@/hooks/useProfile";
import { useEnhanceProfile } from "@/hooks/useAI"; //

const summarySchema = z.object({
  cover_letter: z
    .string()
    .min(10, "Profile summary should be at least 10 characters long")
    .max(1000, "Profile summary should not exceed 1000 characters"),
});

type SummaryFormData = z.infer<typeof summarySchema>;

interface ProfileSummaryDialogProps {
  children: React.ReactNode;
  summary: string;
  onSave?: () => void;
}

export const ProfileSummaryDialog: React.FC<ProfileSummaryDialogProps> = ({
  children,
  summary,
  onSave,
}) => {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const { mutateAsync: updateProfile } = useUpdateProfile();
  
  // Initialize the AI enhancement mutation
  const { mutateAsync: enhanceProfile, isPending: isGenerating } = useEnhanceProfile();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<SummaryFormData>({
    resolver: zodResolver(summarySchema),
    defaultValues: {
      cover_letter: summary || "",
    },
  });

  const coverLetter = watch("cover_letter");
  const wordCount =
    coverLetter
      ?.trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length || 0;

  const handleGenerate = async () => {
    if (wordCount < 2) {
      toast({
        title: "Too short",
        description: "Please write at least a few sentences before enhancing.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await enhanceProfile({
        description: coverLetter, 
      });

      const enhancedText = result.enhanced;

      if (!enhancedText) {
        throw new Error("No enhanced content received");
      }

      setValue("cover_letter", enhancedText);

      toast({
        title: "Success",
        description: "Profile summary enhanced successfully!",
      });
    } catch (error: any) {
      console.error("Error generating summary:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to enhance profile summary. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: SummaryFormData) => {
    try {
      // data.cover_letter will contain the enhanced text if setValue was called
      await updateProfile({
        profileSummary: data.cover_letter,
      });

      toast({
        title: "Success",
        description: "Profile summary updated successfully",
      });

      setOpen(false);

      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error("Error updating profile summary:", error);
      toast({
        title: "Error",
        description: "Failed to update profile summary",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900 mb-1">
            Profile Summary
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <div className="relative bg-gradient-to-r from-[#DF10FF] to-[#005EFF] px-[1px] py-[1px] rounded-2xl text-white">
            <div className="pl-4 my-1 text-[12px]">
              AI Assistance - Type something which you want to enhance
            </div>
            <div className="bg-white p-2 rounded-2xl text-gray-400">
              <Textarea
                id="cover_letter"
                {...register("cover_letter")}
                placeholder="Get AI assistance to write your Profile Summary"
                className="w-full p-2 pb-10 resize-none min-h-40 border-0 outline-none text-gray-900 focus:outline-none focus:border-0"
                disabled={isGenerating}
                style={{
                  boxShadow: "none",
                }}
              />
            </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGenerate}
                // Change "wordCount < 10" to a lower number like "wordCount < 1"
                disabled={isGenerating || wordCount < 1} 
                className="absolute bottom-2 right-2 bg-white/30 rounded-full px-4 py-0 text-[12px] cursor-pointer hover:bg-blue-500 hover:text-white"
              >
              {isGenerating ? (
                <>
                  <span className="mr-2 animate-pulse"><AIIcon /></span> Generating...
                </>
              ) : (
                <>
                  <AIIcon />
                  Create
                </>
              )}
            </Button>
          </div>

          {errors.cover_letter && (
            <p className="px-4 text-[12px] text-rose-600">
              {errors.cover_letter.message}
            </p>
          )}

          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isGenerating}
              className="rounded-full ml-2"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};