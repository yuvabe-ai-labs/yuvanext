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

const projectSchema = z
  .object({
    projectName: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    technologies: z
      .array(z.string())
      .min(1, "At least one technology is required"),
    completionDate: z.string().optional(),
    projectUrl: z.string().url().optional().or(z.literal("")),
    is_current: z.boolean().default(false),
    start_date: z.string().min(1, "Start date is required"),
  })
  .refine(
    (data) => {
      if (data.is_current || !data.completionDate || !data.start_date) {
        return true;
      }
      const start = new Date(data.start_date);
      const end = new Date(data.completionDate);
      return end >= start;
    },
    {
      message: "End date cannot be before start date",
      path: ["completionDate"],
    },
  );

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

  const getDefaultValues = (): ProjectFormData => {
    if (project) {
      return {
        projectName: project.title || project.name || "",
        description: project.description || "",
        technologies: project.technologies || [],
        completionDate: project.end_date && project.end_date !== "Present" ? project.end_date : "",
        projectUrl: project.project_url || "",
        is_current: project.is_current || project.end_date === "Present",
        start_date: project.start_date || "",
      };
    }
    return {
      projectName: "",
      description: "",
      technologies: [],
      completionDate: "",
      projectUrl: "",
      is_current: false,
      start_date: "",
    };
  };

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
    defaultValues: getDefaultValues(),
  });

  const isCurrent = watch("is_current");
  const technologies = watch("technologies");

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

  const addTechnology = () => {
    if (newTech.trim() && !technologies.includes(newTech.trim())) {
      const updatedTech = [...technologies, newTech.trim()];
      setValue("technologies", updatedTech);
      setNewTech("");
    }
  };

  const removeTechnology = (tech: string) => {
    const updatedTech = technologies.filter((t) => t !== tech);
    setValue("technologies", updatedTech);
  };

  const onSubmit = async (data: ProjectFormData) => {
    try {
      const existingProjects = parseJsonField(profileData?.projects, []);

      const projectPayload = {
        title: data.projectName,
        description: data.description,
        technologies: data.technologies,
        start_date: data.start_date,
        end_date: data.is_current ? "Present" : data.completionDate || "",
        is_current: data.is_current,
        project_url: data.projectUrl || "",
      };

      let updatedProjects;
      if (project?.index !== undefined) {
        // Editing existing project at index
        updatedProjects = existingProjects.map((p: CandidateProject, idx: number) =>
          idx === project.index ? projectPayload : p
        );
      } else {
        // Adding new project
        updatedProjects = [...existingProjects, projectPayload];
      }

      await updateProfile({
        projects: updatedProjects,
      });

      toast({
        title: "Success",
        description: `Project ${project ? "updated" : "added"} successfully`,
      });
      setOpen(false);
      reset();
      setNewTech("");
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error saving project:", error);
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
              <p className="text-sm text-destructive mt-1">
                {errors.projectName.message}
              </p>
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
              <p className="text-sm text-destructive mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <Label>Technologies *</Label>
            <div className="flex space-x-2 mb-2">
              <Input
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                placeholder="Add technology"
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addTechnology())
                }
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
                <Badge
                  key={tech}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {tech}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => removeTechnology(tech)}
                  />
                </Badge>
              ))}
            </div>
            {errors.technologies && (
              <p className="text-sm text-destructive mt-1">
                {errors.technologies.message}
              </p>
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
                <p className="text-sm text-destructive mt-1">
                  {errors.start_date.message}
                </p>
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
                <p className="text-sm text-destructive mt-1">
                  {errors.completionDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_current"
              checked={isCurrent}
              onCheckedChange={(checked) =>
                setValue("is_current", checked as boolean)
              }
            />
            <Label htmlFor="is_current">
              Currently working on this project
            </Label>
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
              <p className="text-sm text-destructive mt-1">
                {errors.projectUrl.message}
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
              {isPending ? "Saving..." : project ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};