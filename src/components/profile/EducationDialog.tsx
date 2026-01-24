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
import { useUpdateProfile, useProfile } from "@/hooks/useProfile";
import { CandidateEducation } from "@/types/profiles.types";

const educationSchema = z
  .object({
    degree: z.string().min(1, "Degree is required"),
    institution: z.string().min(1, "Institution is required"),
    start_year: z.coerce.number().min(1900).max(new Date().getFullYear()),
    end_year: z.coerce
      .number()
      .min(1900)
      .max(new Date().getFullYear() + 10)
      .optional()
      .or(z.nan()),
    score: z.string().optional(),
    is_current: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (data.is_current) return true;

      if (!data.end_year || isNaN(data.end_year)) return false;

      return data.end_year >= data.start_year;
    },
    {
      message:
        "End year is required for completed education and must be after start year",
      path: ["end_year"],
    },
  );

type EducationFormData = z.infer<typeof educationSchema>;

interface EducationWithId extends CandidateEducation {
  index?: number;
}

interface EducationDialogProps {
  children: React.ReactNode;
  education?: EducationWithId;
  onUpdate?: () => void;
}

export const EducationDialog: React.FC<EducationDialogProps> = ({
  children,
  education,
  onUpdate,
}) => {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const { data: profileData } = useProfile();
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    clearErrors,
    reset,
  } = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      degree: education?.degree || "",
      institution: education?.institution || education?.school || "",
      start_year: education?.start_year
        ? Number(education.start_year)
        : undefined,
      end_year: education?.end_year ? Number(education.end_year) : undefined,
      score: education?.score || "",
      is_current: education?.is_current || false,
    },
  });

  const isCurrent = watch("is_current");

  const parseJsonField = (field: any) => (Array.isArray(field) ? field : []);

  const onSubmit = async (data: EducationFormData) => {
    try {
      const existingEdu = parseJsonField(profileData?.education);

      const payload = {
        degree: data.degree,
        institution: data.institution,
        start_year: data.start_year.toString(),
        end_year: data.is_current ? undefined : data.end_year?.toString(),
        score: data.score,
        is_current: data.is_current,
      };

      let updatedEdu;
      if (education?.index !== undefined) {
        updatedEdu = existingEdu.map((e: EducationWithId, idx: number) =>
          idx === education.index ? payload : e,
        );
      } else {
        updatedEdu = [...existingEdu, payload];
      }

      await updateProfile({ education: updatedEdu });
      toast({ title: "Success", description: "Education saved successfully" });
      setOpen(false);
      reset();
      onUpdate?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save education",
        variant: "destructive",
      });
    }
  };

  React.useEffect(() => {
    if (isCurrent) {
      setValue("end_year", NaN);
      clearErrors("end_year");
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
            <Label>Degree *</Label>
            <Input {...register("degree")} className="rounded-full" />
            {errors.degree && (
              <p className="text-xs text-destructive mt-1">
                {errors.degree.message}
              </p>
            )}
          </div>
          <div>
            <Label>Institution *</Label>
            <Input {...register("institution")} className="rounded-full" />
            {errors.institution && (
              <p className="text-xs text-destructive mt-1">
                {errors.institution.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Year *</Label>
              <Input
                type="number"
                {...register("start_year")}
                className="rounded-full"
              />
              {errors.start_year && (
                <p className="text-xs text-destructive mt-1">
                  {errors.start_year.message}
                </p>
              )}
            </div>
            <div>
              <Label>End Year</Label>
              <Input
                type="number"
                disabled={isCurrent}
                {...register("end_year")}
                className="rounded-full"
              />
              {errors.end_year && (
                <p className="text-xs text-destructive mt-1">
                  {errors.end_year.message}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_current"
              checked={isCurrent}
              onCheckedChange={(c) => setValue("is_current", c as boolean)}
            />
            <Label htmlFor="is_current" className="text-sm font-normal">
              Currently studying here
            </Label>
          </div>
          <div>
            <Label>Score/Grade</Label>
            <Input {...register("score")} className="rounded-full" />
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
            <Button type="submit" disabled={isPending} className="rounded-full">
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
