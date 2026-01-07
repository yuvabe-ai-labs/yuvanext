import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useUpdateProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/types/profiles.types";

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
  const { toast } = useToast();
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile();

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

  const [skills, setSkills] = useState<string[]>(
    parseJsonField(profile?.skills, [])
  );
  const [newSkill, setNewSkill] = useState("");

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleSave = async () => {
    try {
      await updateProfile({ skills });

      toast({
        title: "Success",
        description: "Skills updated successfully",
      });

      setOpen(false);

      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error updating skills:", error);
      toast({
        title: "Error",
        description: "Failed to update skills",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Skills</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Add a skill"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={handleKeyPress}
              className="rounded-full"
            />

            <Button type="button" onClick={addSkill} className="rounded-full">
              Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 max-h-40 items-center overflow-y-auto">
            {skills.map((skill, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="px-3 py-1 bg-blue-50 text-blue-500"
              >
                {skill}

                <X
                  className="w-3 h-3 ml-1 cursor-pointer"
                  onClick={() => removeSkill(skill)}
                />
              </Badge>
            ))}
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isPending}
              className="rounded-full"
            >
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
