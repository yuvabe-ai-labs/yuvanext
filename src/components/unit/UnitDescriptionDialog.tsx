import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface UnitDescriptionDialogProps {
  description: string;
  onSave: (description: string) => void;
  title?: string;
  children: React.ReactNode;
}

export const UnitDescriptionDialog = ({
  description,
  onSave,
  title = "Edit Description",
  children,
}: UnitDescriptionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(description);

  // Sync state if prop changes
  useEffect(() => {
    setValue(description || "");
  }, [description]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(value);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter details..."
            rows={8}
            className="resize-none"
          />
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
