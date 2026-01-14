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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AchievementFormValues,
  achievementSchema,
} from "@/lib/unitDialogSchemas";

interface UnitAchievementDialogProps {
  onSave: (achievement: AchievementFormValues) => Promise<void>;
  children: React.ReactNode;
}

export const UnitAchievementDialog = ({
  onSave,
  children,
}: UnitAchievementDialogProps) => {
  const [open, setOpen] = useState(false);

  // 2. Initialize Hook Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AchievementFormValues>({
    resolver: zodResolver(achievementSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
    },
  });

  // 3. Handle Submit
  const onSubmit = async (data: AchievementFormValues) => {
    try {
      await onSave(data);
      reset(); // Clear form
      setOpen(false); // Close dialog
    } catch (error) {
      console.error("Failed to save achievement", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Achievement</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Achievement Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Award or achievement name"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the achievement..."
              rows={3}
              {...register("description")}
            />
          </div>

          {/* Date Field */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" {...register("date")} />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Add Achievement"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
