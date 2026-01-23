import React, { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUpdateProfile } from "@/hooks/useProfile"; // Integrated hook

interface InterestDialogProps {
  children: React.ReactNode;
  interests: string[];
  onUpdate?: () => void; // Renamed to match SkillsDialog pattern
}

export const InterestDialog: React.FC<InterestDialogProps> = ({
  children,
  interests,
  onUpdate,
}) => {
  const [open, setOpen] = useState(false);
  const [newInterest, setNewInterest] = useState("");
  const [currentInterests, setCurrentInterests] = useState<string[]>(interests);

  const { toast } = useToast();
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile(); // Hook usage

  // Synchronize state when dialog opens or interests prop changes
  useEffect(() => {
    if (open) {
      setCurrentInterests(interests);
    }
  }, [open, interests]);

  const addInterest = () => {
    const trimmed = newInterest.trim();
    if (trimmed && !currentInterests.includes(trimmed)) {
      setCurrentInterests([...currentInterests, trimmed]);
      setNewInterest("");
    }
  };

  const removeInterest = (interest: string) => {
    setCurrentInterests(currentInterests.filter((i) => i !== interest));
  };

  const handleSave = async () => {
    try {
      // Direct call to the profile update mutation
      await updateProfile({ interests: currentInterests });

      toast({
        title: "Success",
        description: "Interests updated successfully",
      });

      setOpen(false);

      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error updating interests:", error);
      toast({
        title: "Error",
        description: "Failed to update interests",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
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
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-interest">Add Interest</Label>
            <div className="flex space-x-2">
              <Input
                id="new-interest"
                placeholder="e.g. Machine Learning, Photography"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyPress={handleKeyPress}
                className="rounded-full"
              />
              <Button
                type="button"
                onClick={addInterest}
                className="rounded-full"
              >
                Add
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
            {currentInterests.map((interest, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="px-3 py-1 bg-blue-50 text-blue-500 flex items-center gap-1"
              >
                {interest}
                <X
                  className="w-3 h-3 ml-1 cursor-pointer"
                  onClick={() => removeInterest(interest)}
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
