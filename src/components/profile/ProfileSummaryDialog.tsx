import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import AIIcon from "../ui/custom-icons";
import { useUpdateProfile } from "@/hooks/useProfile";
import { useEnhanceProfile } from "@/hooks/useAI";
import { summarySchema } from "@/lib/schemas";

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
  const { mutateAsync: enhanceProfile, isPending: isGenerating } = useEnhanceProfile();

  const form = useForm<SummaryFormData>({
    resolver: zodResolver(summarySchema),
    defaultValues: {
      profileSummary: summary || "",
    },
  });

  const currentSummary = form.watch("profileSummary");
  const wordCount = currentSummary?.trim() ? currentSummary.trim().split(/\s+/).length : 0;

  const handleGenerate = async () => {
    if (wordCount < 2) {
      toast({
        title: "Too short",
        description: "Please write at least a few words before enhancing.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await enhanceProfile({
        description: currentSummary,
      });

      const enhancedText = result?.enhanced;

      if (!enhancedText) throw new Error("No enhanced content received");

      form.setValue("profileSummary", enhancedText);

      toast({
        title: "Success",
        description: "Profile summary enhanced successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to enhance summary.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: SummaryFormData) => {
    try {
      await updateProfile({
        profileSummary: data.profileSummary,
      });

      toast({
        title: "Success",
        description: "Profile summary updated successfully",
      });

      setOpen(false);
      onSave?.();
    } catch (error) {
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <FormField
              control={form.control}
              name="profileSummary"
              render={({ field }) => (
                <FormItem>
                  <div className="relative bg-gradient-to-r from-[#DF10FF] to-[#005EFF] px-[1px] py-[1px] rounded-2xl text-white">
                    <div className="pl-4 my-1 text-[12px]">
                      AI Assistance - Type something which you want to enhance
                    </div>
                    <div className="bg-white p-2 rounded-2xl">
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Get AI assistance to write your Profile Summary"
                          className="w-full p-2 pb-10 resize-none min-h-40 border-0 outline-none text-gray-900 focus:ring-0"
                          disabled={isGenerating}
                          style={{ boxShadow: "none" }}
                        />
                      </FormControl>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGenerate}
                      disabled={isGenerating || wordCount < 1}
                      className="absolute bottom-2 right-2 bg-white/30 rounded-full px-4 py-0 text-[12px] hover:bg-blue-500 hover:text-white"
                    >
                      {isGenerating ? (
                        <>
                          <span className="mr-2 animate-pulse">
                            <AIIcon />
                          </span>{" "}
                          Generating...
                        </>
                      ) : (
                        <>
                          <AIIcon />
                          Create
                        </>
                      )}
                    </Button>
                  </div>
                  <FormMessage className="px-4 text-[12px]" />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={form.formState.isSubmitting}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || isGenerating}
                className="rounded-full ml-2"
              >
                {form.formState.isSubmitting ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};