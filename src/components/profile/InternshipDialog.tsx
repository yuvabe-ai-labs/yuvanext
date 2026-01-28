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
import { internshipSchema } from "@/lib/schemas";

type InternshipFormData = z.infer<typeof internshipSchema>;

interface InternshipWithId extends CandidateInternship {
  index?: number;
}

interface InternshipDialogProps {
  children: React.ReactNode;
  internship?: InternshipWithId;
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

  const onSubmit = async (data: InternshipFormData) => {
    try {
      // Use nullish coalescing to fall back to an empty array
      const existingInternships = profileData?.internship ?? [];

      // Use spread operator to build the payload
      const internshipPayload = {
        ...data,
        // Ensure end_date is cleared if current, otherwise use form value
        end_date: data.is_current ? "" : data.end_date,
      };

      let updatedInternships;
      if (internship?.index !== undefined) {
        // Edit existing entry at the specified index
        updatedInternships = existingInternships.map((i, idx) =>
          idx === internship.index ? internshipPayload : i
        );
      } else {
        // Append new internship
        updatedInternships = [...existingInternships, internshipPayload];
      }

      await updateProfile({ internship: updatedInternships });
      toast({ title: "Success", description: "Internship saved successfully" });
      setOpen(false);
      reset();
      onUpdate?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save internship",
        variant: "destructive",
      });
    }
  };

  // Logic to clear end date state when "Currently working" is checked
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
            {errors.title && (
              <p className="text-sm text-destructive mt-1">
                {errors.title.message}
              </p>
            )}
          </div>
          <div>
            <Label>Company *</Label>
            <Input {...register("company")} className="rounded-full" />
            {errors.company && (
              <p className="text-sm text-destructive mt-1">
                {errors.company.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date *</Label>
              <Input
                type="date"
                {...register("start_date")}
                className="rounded-full"
              />
              {errors.start_date && (
                <p className="text-sm text-destructive mt-1">
                  {errors.start_date.message}
                </p>
              )}
            </div>
            <div>
              <Label>End Date {!isCurrent && "*"}</Label>
              <Input
                type="date"
                disabled={isCurrent}
                {...register("end_date")}
                className="rounded-full"
              />
              {errors.end_date && (
                <p className="text-sm text-destructive mt-1">
                  {errors.end_date.message}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_current_intern"
              checked={isCurrent}
              onCheckedChange={(c) => setValue("is_current", c as boolean)}
            />
            <Label htmlFor="is_current_intern">Currently working here</Label>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea 
              {...register("description")} 
              placeholder="Roles and responsibilities..."
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
            <Button type="submit" disabled={isPending} className="rounded-full">
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};