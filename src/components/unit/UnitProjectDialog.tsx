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
// import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Update to CamelCase to match new API style (verify backend requirements for arrays)
interface ProjectData {
  projectName: string;
  clientName: string;
  description: string;
  status: string;
  completionDate?: string;
}

interface UnitProjectDialogProps {
  onSave: (project: ProjectData) => void;
  children: React.ReactNode;
}

export const UnitProjectDialog: React.FC<UnitProjectDialogProps> = ({
  onSave,
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<ProjectData>({
    projectName: "",
    clientName: "",
    description: "",
    status: "Ongoing",
    completionDate: "",
  });

  const handleSave = () => {
    if (!formData.projectName.trim()) return alert("Project name is required");
    onSave(formData);
    // Reset form
    setFormData({
      projectName: "",
      clientName: "",
      description: "",
      status: "Ongoing",
      completionDate: "",
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Project</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Project Name */}
          <div>
            <Label htmlFor="projectName">Project Name</Label>
            <Input
              id="projectName"
              placeholder="Enter project name"
              value={formData.projectName}
              onChange={(e) =>
                setFormData({ ...formData, projectName: e.target.value })
              }
            />
          </div>

          {/* Client Name */}
          <div>
            <Label htmlFor="clientName">Client Name</Label>
            <Input
              id="clientName"
              placeholder="Enter client name"
              value={formData.clientName}
              onChange={(e) =>
                setFormData({ ...formData, clientName: e.target.value })
              }
            />
          </div>

          {/* Description (Commented out in your code, keeping it that way) */}
          {/* Description */}
          {/* <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter project description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div> */}
          {/* Status */}
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Ongoing">Ongoing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Completion Date (only if completed) */}
          {formData.status === "Completed" && (
            <div>
              <Label htmlFor="completionDate">Completion Date</Label>
              <Input
                id="completionDate"
                type="date"
                value={formData.completionDate}
                onChange={(e) =>
                  setFormData({ ...formData, completionDate: e.target.value })
                }
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
