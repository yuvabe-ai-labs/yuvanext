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

  const form = useForm<EducationFormData>({
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

  const isCurrent = form.watch("is_current");

  const onSubmit = async (data: EducationFormData) => {
    try {
      const existingEdu = profileData?.education ?? [];
      const payload = { ...data };

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
      form.reset();
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
      form.setValue("end_year", "");
      form.clearErrors("end_year");
    }
  }, [isCurrent, form]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {education ? "Edit Education" : "Add Education"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="degree"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Degree *</FormLabel>
                  <FormControl>
                    <Input {...field} className="rounded-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="institution"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Institution *</FormLabel>
                  <FormControl>
                    <Input {...field} className="rounded-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Year *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        maxLength={4}
                        onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                          e.target.value = e.target.value.replace(/\D/g, "");
                        }}
                        className="rounded-full"
                        placeholder="YYYY"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Year</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        maxLength={4}
                        disabled={isCurrent}
                        onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
                          e.target.value = e.target.value.replace(/\D/g, "");
                        }}
                        className="rounded-full"
                        placeholder="YYYY"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_current"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal cursor-pointer">
                    Currently studying here
                  </FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="score"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Score/Grade</FormLabel>
                  <FormControl>
                    <Input {...field} className="rounded-full" />
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
                {isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};