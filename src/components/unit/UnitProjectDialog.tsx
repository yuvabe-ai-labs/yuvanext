import React, { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProjectFormValues, projectSchema } from "@/lib/unitDialogSchemas";

interface UnitProjectDialogProps {
  onSave: (project: ProjectFormValues) => void;
  children: React.ReactNode;
}

export const UnitProjectDialog: React.FC<UnitProjectDialogProps> = ({
  onSave,
  children,
}) => {
  const [open, setOpen] = useState(false);

  // 2. Initialize Hook Form
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      projectName: "",
      clientName: "",
      description: "",
      status: "Ongoing",
      completionDate: "",
    },
  });

  // Watch status to conditionally render date field
  const status = watch("status");

  // 3. Handle Submit
  const onSubmit = (data: ProjectFormValues) => {
    onSave(data);
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="projectName">
              Project Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="projectName"
              placeholder="Enter project name"
              {...register("projectName")}
            />
            {errors.projectName && (
              <p className="text-xs text-red-500">
                {errors.projectName.message}
              </p>
            )}
          </div>

          {/* Client Name */}
          <div className="space-y-2">
            <Label htmlFor="clientName">Client Name</Label>
            <Input
              id="clientName"
              placeholder="Enter client name"
              {...register("clientName")}
            />
          </div>

          {/* Description (Hidden/Commented as requested) */}
          {/* <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter project description"
              {...register("description")}
            />
          </div> 
          */}

          {/* Status (Controlled Component) */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Ongoing">Ongoing</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Completion Date (Conditional Render) */}
          {status === "Completed" && (
            <div className="space-y-2">
              <Label htmlFor="completionDate">
                Completion Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="completionDate"
                type="date"
                {...register("completionDate")}
              />
              {errors.completionDate && (
                <p className="text-xs text-red-500">
                  {errors.completionDate.message}
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
