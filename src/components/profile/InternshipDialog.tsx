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

  const form = useForm<InternshipFormData>({
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

  const isCurrent = form.watch("is_current");

  const onSubmit = async (data: InternshipFormData) => {
    try {
      const existingInternships = profileData?.internship ?? [];

      const internshipPayload = {
        ...data,
        end_date: data.is_current ? "" : data.end_date,
      };

      let updatedInternships;
      if (internship?.index !== undefined) {
        updatedInternships = existingInternships.map((i, idx) =>
          idx === internship.index ? internshipPayload : i
        );
      } else {
        updatedInternships = [...existingInternships, internshipPayload];
      }

      await updateProfile({ internship: updatedInternships });
      toast({ title: "Success", description: "Internship saved successfully" });
      setOpen(false);
      form.reset();
      onUpdate?.();
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
      form.setValue("end_date", "");
      form.clearErrors("end_date");
    }
  }, [isCurrent, form]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {internship ? "Edit Internship" : "Add Internship"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position Title *</FormLabel>
                  <FormControl>
                    <Input {...field} className="rounded-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company *</FormLabel>
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
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="rounded-full" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date {!isCurrent && "*"}</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        disabled={isCurrent}
                        {...field}
                        className="rounded-full"
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
                  <FormLabel className="font-normal cursor-pointer">
                    Currently working here
                  </FormLabel>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Roles and responsibilities..."
                      className="rounded-xl"
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
                {isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};