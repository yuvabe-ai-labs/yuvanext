import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DescriptionFormValues,
  descriptionSchema,
} from "@/lib/unitDialogSchemas";

interface UnitDescriptionDialogProps {
  description: string;
  onSave: (description: string) => Promise<void> | void; // Support async
  title?: string;
  children: React.ReactNode;
}

export const UnitDescriptionDialog = ({
  description,
  onSave,
  title = "Edit Description",
  children,
}: UnitDescriptionDialogProps) => {
  const [open, setOpen] = useState(false);

  // 2. Initialize Hook Form
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<DescriptionFormValues>({
    resolver: zodResolver(descriptionSchema),
    // 3. Use 'values' to automatically sync with the prop
    values: {
      description: description || "",
    },
  });

  const onSubmit = async (data: DescriptionFormValues) => {
    try {
      await onSave(data.description || "");
      setOpen(false);
    } catch (error) {
      console.error("Failed to save description", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Textarea
            placeholder="Enter details..."
            rows={8}
            className="resize-none"
            {...register("description")}
          />

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
