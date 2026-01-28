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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useUpdateProfile, useProfile } from "@/hooks/useProfile";
import { CandidateProject } from "@/types/profiles.types";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { projectSchema } from "@/lib/schemas";

type ProjectFormData = Omit<z.infer<typeof projectSchema>, "technologies"> & {
  technologies: { value: string }[];
};

interface ProjectWithIndex extends CandidateProject {
  index?: number;
}

interface ProjectDialogProps {
  children: React.ReactNode;
  project?: ProjectWithIndex;
  onUpdate?: () => void;
}

export const ProjectDialog: React.FC<ProjectDialogProps> = ({
  children,
  project,
  onUpdate,
}) => {
  const [open, setOpen] = React.useState(false);
  const [newTech, setNewTech] = React.useState("");
  const { toast } = useToast();
  const { data: profileData } = useProfile();
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      projectName: project?.title || project?.name || "",
      description: project?.description || "",
      technologies: (project?.technologies || []).map((t) => ({ value: t })),
      completionDate: project?.end_date !== "Present" ? project?.end_date : "",
      projectUrl: project?.project_url || "",
      is_current: project?.is_current || project?.end_date === "Present",
      start_date: project?.start_date || "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "technologies",
  });

  const isCurrent = form.watch("is_current");

  const addTechnology = () => {
    const trimmed = newTech.trim();
    if (trimmed) {
      const currentValues = fields.map((f) => f.value);
      if (!currentValues.includes(trimmed)) {
        append({ value: trimmed });
        setNewTech("");
      }
    }
  };

  const onSubmit = async (data: ProjectFormData) => {
    try {
      const existingProjects = profileData?.projects ?? [];
      const projectPayload = {
        ...data,
        technologies: data.technologies.map((t) => t.value),
      };

      let updatedProjects;
      if (project?.index !== undefined) {
        updatedProjects = existingProjects.map((p, idx) =>
          idx === project.index ? projectPayload : p
        );
      } else {
        updatedProjects = [...existingProjects, projectPayload];
      }

      await updateProfile({ projects: updatedProjects });

      toast({
        title: "Success",
        description: `Project ${project ? "updated" : "added"} successfully`,
      });
      setOpen(false);
      form.reset();
      setNewTech("");
      onUpdate?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save project",
        variant: "destructive",
      });
    }
  };

  React.useEffect(() => {
    if (isCurrent) {
      form.setValue("completionDate", "");
      form.clearErrors("completionDate");
    }
  }, [isCurrent, form]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project ? "Edit Project" : "Add Project"}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="projectName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. E-commerce Website" className="rounded-full" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what this project does" 
                      rows={3} 
                      className="rounded-xl" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Technologies *</FormLabel>
              <div className="flex space-x-2 mb-2">
                <Input
                  value={newTech}
                  onChange={(e) => setNewTech(e.target.value)}
                  placeholder="Add technology"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTechnology();
                    }
                  }}
                  className="rounded-full"
                />
                <Button type="button" onClick={addTechnology} size="sm" className="rounded-full">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {fields.map((field, index) => (
                  <Badge key={field.id} variant="secondary" className="flex items-center gap-1">
                    {field.value}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => remove(index)} />
                  </Badge>
                ))}
              </div>
              <FormMessage>{form.formState.errors.technologies?.message}</FormMessage>
            </FormItem>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date *</FormLabel>
                    <FormControl>
                      <Input type="date" className="rounded-full" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="completionDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        disabled={isCurrent} 
                        className="rounded-full" 
                        {...field} 
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
                  <Label className="font-normal">Currently working on this project</Label>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="projectUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://github.com/..." 
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
                {isPending ? "Saving..." : project ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};