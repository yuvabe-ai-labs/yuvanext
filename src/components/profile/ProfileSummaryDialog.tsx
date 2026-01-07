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
import { supabase } from "@/integrations/supabase/client";
import AIIcon from "../ui/custom-icons";
import { useUpdateProfile } from "@/hooks/useProfile";

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
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generatedText, setGeneratedText] = React.useState("");
  const { toast } = useToast();
  const { mutateAsync: updateProfile } = useUpdateProfile();

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
  const characterCount = coverLetter?.length || 0;
  const wordCount =
    coverLetter
      ?.trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length || 0;

  const handleGenerate = async () => {
    if (wordCount < 10) {
      toast({
        title: "Too short",
        description: "Please write at least a few sentences before enhancing.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("gemini-chat", {
        body: JSON.stringify({
          message: coverLetter,
          conversationHistory: [],
          userRole: "profile_summary",
        }),
      });

      if (error) throw error;

      const enhancedText =
        data?.response ||
        data?.text ||
        data?.data?.response ||
        (typeof data === "string" ? data : "") ||
        "";

      if (!enhancedText) {
        throw new Error("No response received from AI function");
      }

      setGeneratedText(enhancedText);
      setValue("cover_letter", enhancedText);

      toast({
        title: "Success",
        description: "Profile summary enhanced successfully!",
      });
    } catch (error) {
      console.error("Error generating summary:", error);
      toast({
        title: "Error",
        description: "Failed to enhance profile summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (data: SummaryFormData) => {
    try {
      const textToSave = generatedText || data.cover_letter;

      // Use updateProfile mutation
      await updateProfile({
        profileSummary: textToSave,
      });

      toast({
        title: "Success",
        description: "Profile summary updated successfully",
      });

      setOpen(false);

      // Call optional callback
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
              disabled={isGenerating || wordCount < 10}
              className="absolute bottom-2 right-2 bg-white/30 rounded-full px-4 py-0 text-[12px] cursor-pointer hover:bg-blue-500 hover:text-white"
            >
              {isGenerating ? (
                <>
                  <AIIcon /> Generating...
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
