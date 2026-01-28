import React, { useState, useEffect } from "react";
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
import { useUpdateProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/types/profiles.types";
import { skillsFormSchema } from "@/lib/schemas";

type SkillsFormData = z.infer<typeof skillsFormSchema>;

interface SkillsDialogProps {
  profile: Profile | null | undefined;
  onUpdate?: () => void;
  children: React.ReactNode;
}

export const SkillsDialog = ({
  profile,
  onUpdate,
  children,
}: SkillsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const { toast } = useToast();
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();

  const form = useForm<SkillsFormData>({
    resolver: zodResolver(skillsFormSchema),
    defaultValues: {
      skills: (profile?.skills ?? []).map((s) => ({ value: s })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "skills",
  });

  // Sync internal state when profile data changes or dialog opens
  useEffect(() => {
    if (open && profile?.skills) {
      form.reset({
        skills: profile.skills.map((s) => ({ value: s })),
      });
    }
  }, [open, profile?.skills, form]);

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed) {
      const currentValues = fields.map((f) => f.value);
      if (!currentValues.includes(trimmed)) {
        append({ value: trimmed });
        setNewSkill("");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const onSubmit = async (data: SkillsFormData) => {
    try {
      // Map object array back to string array for the API
      const skillStrings = data.skills.map((s) => s.value);
      await updateProfile({ skills: skillStrings });

      toast({
        title: "Success",
        description: "Skills updated successfully",
      });

      setOpen(false);
      onUpdate?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update skills",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Skills</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormItem>
              <FormLabel>Add a skill</FormLabel>
              <div className="flex space-x-2">
                <FormControl>
                  <Input
                    placeholder="e.g. React, TypeScript, Node.js"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="rounded-full"
                  />
                </FormControl>
                <Button 
                  type="button" 
                  onClick={addSkill} 
                  className="rounded-full"
                >
                  Add
                </Button>
              </div>
              <FormMessage />
            </FormItem>

            <div className="flex flex-wrap gap-2 max-h-40 items-center overflow-y-auto p-1">
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