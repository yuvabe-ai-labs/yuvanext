import { useState, useEffect } from "react";
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

  // Initialize state directly using nullish coalescing
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  // Sync internal state when dialog opens or profile data changes
  useEffect(() => {
    if (open) {
      setSkills(profile?.skills ?? []);
    }
  }, [open, profile?.skills]);

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleSave = async () => {
    try {
      // Direct call to updateProfile using the simple string array
      await updateProfile({ skills });

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
              onKeyDown={handleKeyDown} // Using onKeyDown instead of deprecated onKeyPress
              className="rounded-full"
            />

            <Button type="button" onClick={addSkill} className="rounded-full">
              Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 max-h-40 items-center overflow-y-auto p-1">
            {skills.map((skill, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="px-3 py-1 bg-blue-50 text-blue-500 flex items-center gap-1"
              >
                {skill}
                <X
                  className="w-3 h-3 ml-1 cursor-pointer"
                  onClick={() => removeSkill(skill)}
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