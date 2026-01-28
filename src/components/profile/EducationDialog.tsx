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
import { educationSchema } from "@/lib/schemas";

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
      start_year: education?.start_year || "",
      end_year: education?.end_year || "",
      score: education?.score || "",
      is_current: education?.is_current || false,
    },
  });

  const isCurrent = watch("is_current");

  const onSubmit = async (data: EducationFormData) => {
    try {
      const existingEdu = profileData?.education ?? [];

      const payload = {
        ...data,
      };

      let updatedEdu;
      if (education?.index !== undefined) {
        updatedEdu = existingEdu.map((e, idx) =>
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

  // Auto-clear end_year when "Currently studying" is checked
  React.useEffect(() => {
    if (isCurrent) {
      setValue("end_year", "");
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
              <p className="text-xs text-destructive mt-1">{errors.degree.message}</p>
            )}
          </div>
          <div>
            <Label>Institution *</Label>
            <Input {...register("institution")} className="rounded-full" />
            {errors.institution && (
              <p className="text-xs text-destructive mt-1">{errors.institution.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Year *</Label>
              <Input
                type="text"
                maxLength={4}
                {...register("start_year")}
                onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                  e.target.value = e.target.value.replace(/\D/g, "");
                }}
                className="rounded-full"
                placeholder="YYYY"
              />
              {errors.start_year && (
                <p className="text-xs text-destructive mt-1">{errors.start_year.message}</p>
              )}
            </div>
            <div>
              <Label>End Year</Label>
              <Input
                type="text"
                maxLength={4}
                disabled={isCurrent}
                {...register("end_year")}
                onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                  e.target.value = e.target.value.replace(/\D/g, "");
                }}
                className="rounded-full"
                placeholder="YYYY"
              />
              {errors.end_year && (
                <p className="text-xs text-destructive mt-1">{errors.end_year.message}</p>
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