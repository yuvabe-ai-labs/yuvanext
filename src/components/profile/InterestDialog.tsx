import React, { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useUpdateProfile } from "@/hooks/useProfile";
import { interestsSchema } from "@/lib/schemas";

type InterestsFormData = z.infer<typeof interestsSchema>;

interface InterestDialogProps {
  children: React.ReactNode;
  interests: string[];
  onUpdate?: () => void;
}

export const InterestDialog: React.FC<InterestDialogProps> = ({
  children,
  interests,
  onUpdate,
}) => {
  const [open, setOpen] = useState(false);
  const [newInterest, setNewInterest] = useState("");
  const { toast } = useToast();
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();

  const form = useForm<InterestsFormData>({
    resolver: zodResolver(interestsSchema),
    defaultValues: {
      interests: (interests ?? []).map((i) => ({ value: i })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "interests",
  });

  const addInterest = () => {
    const trimmed = newInterest.trim();
    if (trimmed) {
      const currentValues = fields.map((f) => f.value);
      if (!currentValues.includes(trimmed)) {
        append({ value: trimmed });
        setNewInterest("");
      }
    }
  };

  const onSubmit = async (data: InterestsFormData) => {
    try {
      // Map object array back to string array for the API
      const stringInterests = data.interests.map((i) => i.value);
      await updateProfile({ interests: stringInterests });

      toast({
        title: "Success",
        description: "Interests updated successfully",
      });

      setOpen(false);
      onUpdate?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update interests",
        variant: "destructive",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addInterest();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Interests</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormItem>
              <FormLabel>Add Interest</FormLabel>
              <div className="flex space-x-2">
                <FormControl>
                  <Input
                    placeholder="e.g. Machine Learning, Photography"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="rounded-full"
                  />
                </FormControl>
                <Button
                  type="button"
                  onClick={addInterest}
                  className="rounded-full"
                >
                  Add
                </Button>
              </div>
              <FormMessage />
            </FormItem>

            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
              {fields.map((field, index) => (
                <Badge
                  key={field.id}
                  variant="secondary"
                  className="px-3 py-1 bg-blue-50 text-blue-500 flex items-center gap-1"
                >
                  {field.value}
                  <X
                    className="w-3 h-3 ml-1 cursor-pointer"
                    onClick={() => remove(index)}
                  />
                </Badge>
              ))}
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
                disabled={isPending}
                className="rounded-full"
              >
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};