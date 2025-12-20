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
import { ProjectEntry } from "@/types/profile";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

const projectSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    technologies: z
      .array(z.string())
      .min(1, "At least one technology is required"),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().optional(),
    project_url: z.string().url().optional().or(z.literal("")),
    is_current: z.boolean().default(false),
  })
  .refine(
    (data) => {
      // If currently working, or if dates are missing, skip this validation
      if (data.is_current || !data.end_date || !data.start_date) {
        return true;
      }
      // Convert strings to Date objects for comparison
      const start = new Date(data.start_date);
      const end = new Date(data.end_date);
      return end >= start;
    },
    {
      message: "End date cannot be before start date",
      path: ["end_date"], // Attach error to end_date field
    }
  );

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectDialogProps {
  children: React.ReactNode;
  project?: ProjectEntry;
  onSave: (project: Omit<ProjectEntry, "id">) => Promise<void>;
}

export const ProjectDialog: React.FC<ProjectDialogProps> = ({
  children,
  project,
  onSave,
}) => {
  const [open, setOpen] = React.useState(false);
  const [newTech, setNewTech] = React.useState("");
  const [technologies, setTechnologies] = React.useState<string[]>(
    project?.technologies || []
  );
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    clearErrors, // Added clearErrors
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project?.title || "",
      description: project?.description || "",
      technologies: project?.technologies || [],
      start_date: project?.start_date || "",
      end_date: project?.end_date || "",
      project_url: project?.project_url || "",
      is_current: project?.is_current || false,
    },
  });

  const isCurrent = watch("is_current");

  const addTechnology = () => {
    if (newTech.trim() && !technologies.includes(newTech.trim())) {
      const updatedTech = [...technologies, newTech.trim()];
      setTechnologies(updatedTech);
      setValue("technologies", updatedTech);
      setNewTech("");
    }
  };

  const removeTechnology = (tech: string) => {
    const updatedTech = technologies.filter((t) => t !== tech);
    setTechnologies(updatedTech);
    setValue("technologies", updatedTech);
  };

  const onSubmit = async (data: ProjectFormData) => {
    try {
      await onSave({
        title: data.title!,
        description: data.description!,
        technologies,
        start_date: data.start_date!,
        end_date: data.is_current ? null : data.end_date || null,
        project_url: data.project_url || null,
        is_current: data.is_current!,
      } as Omit<ProjectEntry, "id">);
      toast({
        title: "Success",
        description: `Project ${project ? "updated" : "added"} successfully`,
      });
      setOpen(false);
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
      setValue("end_date", "");
      clearErrors("end_date"); // Clear error when switching to current
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
            <Label htmlFor="title">Project Title *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="e.g. E-commerce Website"
              className="rounded-full"
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">
                {errors.title.message}
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
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                disabled={isCurrent}
                {...register("end_date")}
                className="rounded-full"
              />
              {/* Added Error Message Display Below */}
              {errors.end_date && (
                <p className="text-sm text-destructive mt-1">
                  {errors.end_date.message}
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
            <Label htmlFor="project_url">Project URL</Label>
            <Input
              className="rounded-full"
              id="project_url"
              type="url"
              {...register("project_url")}
              placeholder="https://github.com/username/project"
            />
            {errors.project_url && (
              <p className="text-sm text-destructive mt-1">
                {errors.project_url.message}
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
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full"
            >
              {isSubmitting ? "Saving..." : project ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
