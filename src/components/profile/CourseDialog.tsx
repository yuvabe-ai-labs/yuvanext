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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useUpdateProfile, useProfile } from "@/hooks/useProfile"; //
import { CandidateCourse } from "@/types/profiles.types"; //

const courseSchema = z.object({
  title: z.string().min(1, "Course title is required"),
  provider: z.string().min(1, "Provider is required"),
  completion_date: z.string().min(1, "Completion date is required"),
  certificate_url: z.string().url().optional().or(z.literal("")),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface CourseDialogProps {
  children: React.ReactNode;
  course?: CandidateCourse;
  onUpdate?: () => void;
}

export const CourseDialog: React.FC<CourseDialogProps> = ({
  children,
  course,
  onUpdate,
}) => {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const { data: profileData } = useProfile(); //
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile(); //

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: course?.title || "",
      provider: course?.provider || "",
      completion_date: course?.completion_date || "",
      certificate_url: course?.certificate_url || "",
    },
  });

  // Helper to safely parse array fields from profile
  const parseJsonField = (field: any, defaultValue: any = []) => {
    if (!field) return defaultValue;
    if (typeof field === "string") {
      try {
        return JSON.parse(field);
      } catch {
        return defaultValue;
      }
    }
    return Array.isArray(field) ? field : defaultValue;
  };

  const onSubmit = async (data: CourseFormData) => {
    try {
      const existingCourses = parseJsonField(profileData?.course, []);

      let updatedCourses;
      if (course?.id) {
        // Update: match by ID for accuracy
        updatedCourses = existingCourses.map((c: CandidateCourse) =>
          c.id === course.id ? { ...c, ...data } : c,
        );
      } else {
        // Add: generate a temporary ID if backend doesn't handle it, or let backend assign
        const newCourse = {
          ...data,
          id: crypto.randomUUID(), // Ensure new entries have a unique identifier
        };
        updatedCourses = [...existingCourses, newCourse];
      }

      await updateProfile({
        course: updatedCourses, //
      });

      toast({
        title: "Success",
        description: `Course ${course ? "updated" : "added"} successfully`,
      });

      setOpen(false);
      reset();

      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error saving course:", error);
      toast({
        title: "Error",
        description: "Failed to save course",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {course ? "Edit Course" : "Add Completed Course"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Course Title *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="e.g. React Development Course"
              className="rounded-full"
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="provider">Provider *</Label>
            <Input
              id="provider"
              {...register("provider")}
              placeholder="e.g. Coursera, Udemy, University"
              className="rounded-full"
            />
            {errors.provider && (
              <p className="text-sm text-destructive mt-1">
                {errors.provider.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="completion_date">Completion Date *</Label>
            <Input
              id="completion_date"
              type="date"
              {...register("completion_date")}
              className="rounded-full"
            />
            {errors.completion_date && (
              <p className="text-sm text-destructive mt-1">
                {errors.completion_date.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="certificate_url">Certificate URL</Label>
            <Input
              id="certificate_url"
              type="url"
              {...register("certificate_url")}
              placeholder="https://certificate-url.com"
              className="rounded-full"
            />
            {errors.certificate_url && (
              <p className="text-sm text-destructive mt-1">
                {errors.certificate_url.message}
              </p>
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
            <Button type="submit" disabled={isPending} className="rounded-full">
              {isPending ? "Saving..." : course ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
