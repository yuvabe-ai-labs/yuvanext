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
import { useUpdateProfile, useProfile } from "@/hooks/useProfile";
import { CandidateInternship } from "@/types/profiles.types";

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
      if (data.is_current || !data.end_date || !data.start_date) return true;
      return new Date(data.end_date) >= new Date(data.start_date);
    },
    { message: "End date cannot be before start date", path: ["end_date"] },
  );

type InternshipFormData = z.infer<typeof internshipSchema>;

interface InternshipDialogProps {
  children: React.ReactNode;
  internship?: CandidateInternship;
  onUpdate?: () => void;
}

export const InternshipDialog: React.FC<InternshipDialogProps> = ({
  children,
  internship,
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
  const parseJsonField = (field: any) => (Array.isArray(field) ? field : []);

  const onSubmit = async (data: InternshipFormData) => {
    try {
      const existingInternships = parseJsonField(profileData?.internship);
      let updatedInternships;

      if (internship?.id) {
        updatedInternships = existingInternships.map(
          (i: CandidateInternship) =>
            i.id === internship.id ? { ...i, ...data } : i,
        );
      } else {
        updatedInternships = [
          ...existingInternships,
          { ...data, id: crypto.randomUUID() },
        ];
      }

      await updateProfile({ internship: updatedInternships });
      toast({ title: "Success", description: "Internship saved successfully" });
      setOpen(false);
      reset();
      onUpdate?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save",
        variant: "destructive",
      });
    }
  };

  React.useEffect(() => {
    if (isCurrent) {
      setValue("end_date", "");
      clearErrors("end_date");
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
            <Label>Position Title *</Label>
            <Input {...register("title")} className="rounded-full" />
          </div>
          <div>
            <Label>Company *</Label>
            <Input {...register("company")} className="rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date *</Label>
              <Input
                type="date"
                {...register("start_date")}
                className="rounded-full"
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                disabled={isCurrent}
                {...register("end_date")}
                className="rounded-full"
              />
              {errors.end_date && (
                <p className="text-sm text-destructive">
                  {errors.end_date.message}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={isCurrent}
              onCheckedChange={(c) => setValue("is_current", c as boolean)}
            />
            <Label>Currently working here</Label>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea {...register("description")} className="rounded-xl" />
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
