import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useUpdateProfile, useProfile } from "@/hooks/useProfile";
import { CandidateCourse } from "@/types/profiles.types";
import { courseSchema } from "@/lib/schemas";

type CourseFormData = z.infer<typeof courseSchema>;

interface CourseWithIndex extends CandidateCourse {
  index?: number;
}

interface CourseDialogProps {
  children: React.ReactNode;
  course?: CourseWithIndex;
  onUpdate?: () => void;
}

export const CourseDialog: React.FC<CourseDialogProps> = ({
  children,
  course,
  onUpdate,
}) => {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const { data: profileData } = useProfile();
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: course?.title || "",
      provider: course?.provider || "",
      completion_date: course?.completion_date || "",
      certificate_url: course?.certificate_url || "",
    },
  });

  const onSubmit = async (data: CourseFormData) => {
    try {
      const existingCourses = profileData?.course ?? [];
      const payload = { ...data };

      let updatedCourses;
      if (course?.index !== undefined) {
        updatedCourses = existingCourses.map((c, idx) =>
          idx === course.index ? payload : c
        );
      } else {
        updatedCourses = [...existingCourses, payload];
      }

      await updateProfile({
        course: updatedCourses,
      });

      toast({
        title: "Success",
        description: `Course ${course ? "updated" : "added"} successfully`,
      });

      setOpen(false);
      form.reset();
      onUpdate?.();
    } catch (error) {
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Title *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. React Development Course"
                      className="rounded-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provider *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Coursera, Udemy, University"
                      className="rounded-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="completion_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Completion Date *</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      className="rounded-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="certificate_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certificate URL</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://certificate-url.com"
                      className="rounded-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
        </Form>
      </DialogContent>
    </Dialog>
  );
};