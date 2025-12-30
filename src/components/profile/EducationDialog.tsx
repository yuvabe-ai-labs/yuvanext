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
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { EducationEntry } from "@/types/profile";

const educationSchema = z
  .object({
    degree: z.string().min(1, "Degree is required"),
    institution: z.string().min(1, "Institution is required"),
    start_year: z
      .number({ invalid_type_error: "Start year is required" })
      .min(1900)
      .max(new Date().getFullYear()),
    end_year: z
      .number()
      .min(1900)
      .max(new Date().getFullYear() + 10)
      .optional()
      .or(z.nan()), // Handle empty number inputs turning into NaN
    score: z.string().optional(),
    is_current: z.boolean().default(false),
  })
  .refine(
    (data) => {
      // If currently studying, or if end_year/start_year are missing, skip this validation
      if (data.is_current || !data.end_year || !data.start_year) {
        return true;
      }
      // Validation: End year must be greater than or equal to Start year
      return data.end_year >= data.start_year;
    },
    {
      message: "End year cannot be before start year",
      path: ["end_year"], // This ensures the red error shows under the 'End Year' input
    }
  );
// --- CHANGED SECTION END ---

type EducationFormData = z.infer<typeof educationSchema>;

interface EducationDialogProps {
  children: React.ReactNode;
  education?: EducationEntry;
  onSave: (education: Omit<EducationEntry, "id">) => Promise<void>;
}

export const EducationDialog: React.FC<EducationDialogProps> = ({
  children,
  education,
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
    clearErrors, // Added to clear errors when checkbox changes
  } = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      degree: education?.degree || "",
      institution: education?.institution || "",
      start_year: education?.start_year || undefined,
      end_year: education?.end_year || undefined,
      score: education?.score || "",
      is_current: education?.is_current || false,
    },
  });

  const isCurrent = watch("is_current");

  const onSubmit = async (data: EducationFormData) => {
    try {
      await onSave({
        degree: data.degree!,
        institution: data.institution!,
        start_year: data.start_year!,
        end_year: data.is_current ? null : data.end_year || null,
        score: data.score || null,
        is_current: data.is_current!,
      } as Omit<EducationEntry, "id">);
      toast({
        title: "Success",
        description: `Education ${
          education ? "updated" : "added"
        } successfully`,
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save education entry",
        variant: "destructive",
      });
    }
  };

  React.useEffect(() => {
    if (isCurrent) {
      setValue("end_year", undefined);
      clearErrors("end_year"); // Clear the date error if they switch to "Currently studying"
    }
  }, [isCurrent, setValue, clearErrors]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {education ? "Edit Education" : "Add Education"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="degree">Degree *</Label>
            <Input
              id="degree"
              {...register("degree")}
              placeholder="e.g. Bachelor of Science"
              className="rounded-full"
            />
            {errors.degree && (
              <p className="text-sm text-destructive mt-1">
                {errors.degree.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="institution">Institution *</Label>
            <Input
              id="institution"
              {...register("institution")}
              placeholder="e.g. University of Technology"
              className="rounded-full"
            />
            {errors.institution && (
              <p className="text-sm text-destructive mt-1">
                {errors.institution.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_year">Start Year *</Label>
              <Input
                min={1900}
                max={new Date().getFullYear()}
                id="start_year"
                type="number"
                {...register("start_year", { valueAsNumber: true })}
                className="rounded-full"
              />
              {errors.start_year && (
                <p className="text-sm text-destructive mt-1">
                  {errors.start_year.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="end_year">End Year</Label>
              <Input
                min={1900}
                max={new Date().getFullYear() + 10}
                id="end_year"
                type="number"
                disabled={isCurrent}
                {...register("end_year", { valueAsNumber: true })}
                className="rounded-full"
              />
              {errors.end_year && (
                <p className="text-sm text-destructive mt-1">
                  {errors.end_year.message}
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
            <Label htmlFor="is_current">Currently studying here</Label>
          </div>

          <div>
            <Label htmlFor="score">Score/Grade</Label>
            <Input
              id="score"
              {...register("score")}
              placeholder="e.g. 3.8 GPA, First Class"
              className="rounded-full"
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
              {isSubmitting ? "Saving..." : education ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
