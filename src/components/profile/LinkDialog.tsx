import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { LinkEntry } from "@/types/profile";

const linkSchema = z.object({
  platform: z.string().min(1, "Platform name is required"),
  url: z.string().url("Enter a valid URL").min(1, "URL is required"),
});

type LinkFormData = z.infer<typeof linkSchema>;

interface LinkDialogProps {
  children: React.ReactNode;
  link?: LinkEntry;
  existingLinks?: LinkEntry[];
  onSave: (link: Omit<LinkEntry, "id">) => Promise<void>;
}

export const LinkDialog: React.FC<LinkDialogProps> = ({
  children,
  link,
  existingLinks = [],
  onSave,
}) => {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const [duplicatePlatform, setDuplicatePlatform] = React.useState("");
  const [duplicateUrl, setDuplicateUrl] = React.useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LinkFormData>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      platform: link?.platform || "",
      url: link?.url || "",
    },
  });

  const onSubmit = async (data: LinkFormData) => {
    // ✅ Reset duplicate messages
    setDuplicatePlatform("");
    setDuplicateUrl("");

    const platformExists = existingLinks.some(
      (l) =>
        l.platform?.toLowerCase() === data.platform.toLowerCase() &&
        l.platform?.toLowerCase() !== link?.platform?.toLowerCase(),
    );

    const urlExists = existingLinks.some(
      (l) =>
        l.url?.toLowerCase() === data.url.toLowerCase() &&
        l.url?.toLowerCase() !== link?.url?.toLowerCase(),
    );

    if (platformExists) {
      setDuplicatePlatform("This platform already exists.");
      return;
    }

    if (urlExists) {
      setDuplicateUrl("This URL already exists.");
      return;
    }

    try {
      await onSave({ platform: data.platform, url: data.url } as Omit<
        LinkEntry,
        "id"
      >);

      toast({
        title: "Success",
        description: `Link ${link ? "updated" : "added"} successfully`,
      });
      setOpen(false);
    } catch (error) {
      console.log(error);

      toast({
        title: "Error",
        description: "Failed to save link",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-">
        <DialogHeader>
          <DialogTitle>{link ? "Edit Link" : "Add Link"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="platform">Platform *</Label>
            <Input
              id="platform"
              {...register("platform")}
              placeholder="e.g. LinkedIn, Dribbble, Behance"
              className="rounded-full"
            />
            {errors.platform && (
              <p className="text-sm text-destructive mt-1">
                {errors.platform.message}
              </p>
            )}
            {duplicatePlatform && (
              <p className="text-sm text-red-500 mt-1">{duplicatePlatform}</p>
            )}
          </div>

          <div>
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              {...register("url")}
              placeholder="https://example.com/your-profile"
              className="rounded-full"
            />
            {errors.url && (
              <p className="text-sm text-destructive mt-1">
                {errors.url.message}
              </p>
            )}
            {duplicateUrl && (
              <p className="text-sm text-red-500 mt-1">{duplicateUrl}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full"
            >
              {isSubmitting ? "Saving..." : link ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
