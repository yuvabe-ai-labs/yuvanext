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
import { CandidateProject } from "@/types/profiles.types";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { projectSchema } from "@/lib/schemas";

type ProjectFormData = z.infer<typeof projectSchema>;

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

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    clearErrors,
    reset,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      projectName: project?.title || project?.name || "",
      description: project?.description || "",
      technologies: project?.technologies || [],
      completionDate: project?.end_date !== "Present" ? project?.end_date : "",
      projectUrl: project?.project_url || "",
      is_current: project?.is_current || project?.end_date === "Present",
      start_date: project?.start_date || "",
    },
  });

  const isCurrent = watch("is_current");
  const technologies = watch("technologies");

  const addTechnology = () => {
    const trimmed = newTech.trim();
    if (trimmed && !technologies.includes(trimmed)) {
      setValue("technologies", [...technologies, trimmed]);
      setNewTech("");
    }
  };

  const removeTechnology = (tech: string) => {
    setValue("technologies", technologies.filter((t) => t !== tech));
  };

  const onSubmit = async (data: ProjectFormData) => {
    try {
      // Use nullish coalescing instead of custom parsing function
      const existingProjects = profileData?.projects ?? [];

      const projectPayload = {
        ...data,
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
      reset();
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
      setValue("completionDate", "");
      clearErrors("completionDate");
    }
  }, [isCurrent, setValue, clearErrors]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project ? "Edit Project" : "Add Project"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="projectName">Project Title *</Label>
            <Input
              id="projectName"
              {...register("projectName")}
              placeholder="e.g. E-commerce Website"
              className="rounded-full"
            />
            {errors.projectName && (
              <p className="text-sm text-destructive mt-1">{errors.projectName.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe what this project does and your role in it"
              rows={3}
              className="rounded-xl"
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <Label>Technologies *</Label>
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
              <Button
                type="button"
                onClick={addTechnology}
                size="sm"
                className="rounded-full"
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {technologies.map((tech) => (
                <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                  {tech}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeTechnology(tech)} />
                </Badge>
              ))}
            </div>
            {errors.technologies && (
              <p className="text-sm text-destructive mt-1">{errors.technologies.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                {...register("start_date")}
                className="rounded-full"
              />
              {errors.start_date && (
                <p className="text-sm text-destructive mt-1">{errors.start_date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="completionDate">End Date</Label>
              <Input
                id="completionDate"
                type="date"
                disabled={isCurrent}
                {...register("completionDate")}
                className="rounded-full"
              />
              {errors.completionDate && (
                <p className="text-sm text-destructive mt-1">{errors.completionDate.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_current"
              checked={isCurrent}
              onCheckedChange={(checked) => setValue("is_current", checked as boolean)}
            />
            <Label htmlFor="is_current">Currently working on this project</Label>
          </div>

          <div>
            <Label htmlFor="projectUrl">Project URL</Label>
            <Input
              className="rounded-full"
              id="projectUrl"
              type="url"
              {...register("projectUrl")}
              placeholder="https://github.com/username/project"
            />
            {errors.projectUrl && (
              <p className="text-sm text-destructive mt-1">{errors.projectUrl.message}</p>
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
              {isPending ? "Saving..." : project ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};