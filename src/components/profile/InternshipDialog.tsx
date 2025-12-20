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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { InternshipEntry } from "@/types/profile";

const internshipSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    company: z.string().min(1, "Company is required"),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().optional(),
    description: z.string().optional(),
    is_current: z.boolean().default(false),
  })
  .refine(
    (data) => {
      // If currently working, or if dates are missing, skip this validation
      if (data.is_current || !data.end_date || !data.start_date) {
        return true;
      }
      // Convert strings to Date objects for comparison
      const start = new Date(data.start_date);
      const end = new Date(data.end_date);
      return end >= start;
    },
    {
      message: "End date cannot be before start date",
      path: ["end_date"], // Attach error to end_date field
    }
  );

type InternshipFormData = z.infer<typeof internshipSchema>;

interface InternshipDialogProps {
  children: React.ReactNode;
  internship?: InternshipEntry;
  onSave: (internship: Omit<InternshipEntry, "id">) => Promise<void>;
}

export const InternshipDialog: React.FC<InternshipDialogProps> = ({
  children,
  internship,
  onSave,
}) => {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    clearErrors, // Added clearErrors
  } = useForm<InternshipFormData>({
    resolver: zodResolver(internshipSchema),
    defaultValues: {
      title: internship?.title || "",
      company: internship?.company || "",
      start_date: internship?.start_date || "",
      end_date: internship?.end_date || "",
      description: internship?.description || "",
      is_current: internship?.is_current || false,
    },
  });

  const isCurrent = watch("is_current");

  const onSubmit = async (data: InternshipFormData) => {
    try {
      await onSave({
        title: data.title!,
        company: data.company!,
        start_date: data.start_date!,
        end_date: data.is_current ? null : data.end_date || null,
        description: data.description || null,
        is_current: data.is_current!,
      } as Omit<InternshipEntry, "id">);
      toast({
        title: "Success",
        description: `Internship ${
          internship ? "updated" : "added"
        } successfully`,
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save internship",
        variant: "destructive",
      });
    }
  };

  React.useEffect(() => {
    if (isCurrent) {
      setValue("end_date", "");
      clearErrors("end_date"); // Clear error when switching to "current"
    }
  }, [isCurrent, setValue, clearErrors]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {internship ? "Edit Internship" : "Add Internship"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Position Title *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="e.g. Software Development Intern"
              className="rounded-full"
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="company">Company *</Label>
            <Input
              id="company"
              {...register("company")}
              placeholder="e.g. Tech Corp"
              className="rounded-full"
            />
            {errors.company && (
              <p className="text-sm text-destructive mt-1">
                {errors.company.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                className="rounded-full"
                id="start_date"
                type="date"
                {...register("start_date")}
              />
              {errors.start_date && (
                <p className="text-sm text-destructive mt-1">
                  {errors.start_date.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input
                className="rounded-full"
                id="end_date"
                type="date"
                disabled={isCurrent}
                {...register("end_date")}
              />
              {/* Added Error Message Display Below */}
              {errors.end_date && (
                <p className="text-sm text-destructive mt-1">
                  {errors.end_date.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_current"
              checked={isCurrent}
              onCheckedChange={(checked) =>
                setValue("is_current", checked as boolean)
              }
            />
            <Label htmlFor="is_current">Currently working here</Label>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe your responsibilities and achievements"
              rows={3}
              className="rounded-xl"
            />
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
              {isSubmitting ? "Saving..." : internship ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
