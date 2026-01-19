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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UnitValuesDialogProps {
  values?: string[]; // Make optional to be safe
  onSave: (values: string[]) => Promise<void> | void;
  children: React.ReactNode;
}

export const UnitValuesDialog = ({
  values = [],
  onSave,
  children,
}: UnitValuesDialogProps) => {
  const [open, setOpen] = useState(false);
  const [valuesList, setValuesList] = useState<string[]>([]);
  const [newValue, setNewValue] = useState("");
  const { toast } = useToast();

  // Sync state when dialog opens
  useEffect(() => {
    if (open) {
      setValuesList(values || []);
      setNewValue("");
    }
  }, [open, values]);

  const handleAddValue = () => {
    const trimmedValue = newValue.trim();

    if (!trimmedValue) return;

    if (valuesList.includes(trimmedValue)) {
      toast({
        title: "Duplicate Value",
        description: "This value has already been added.",
        variant: "destructive",
      });
      return;
    }

    setValuesList([...valuesList, trimmedValue]);
    setNewValue("");
  };

  const handleRemoveValue = (index: number) => {
    setValuesList(valuesList.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSave(valuesList);
      setOpen(false);
    } catch (error) {
      console.error("Failed to save values", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Core Values</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Add Value Input */}
          <div className="space-y-2">
            <Label htmlFor="value">Add Value</Label>
            <div className="flex gap-2">
              <Input
                id="value"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="e.g., Innovation, Integrity"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault(); // Prevent form submission
                    handleAddValue();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleAddValue}
                variant="secondary"
                disabled={!newValue.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Values List */}
          <div>
            <Label className="mb-2 block text-sm font-medium">
              Current Values
            </Label>
            <div className="min-h-[100px] p-3 border rounded-md bg-muted/20">
              <div className="flex flex-wrap gap-2">
                {valuesList.map((value, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="pl-3 pr-1 py-1 flex items-center gap-1 bg-white border border-gray-200 hover:bg-gray-50"
                  >
                    {value}
                    <button
                      type="button"
                      className="ml-1 p-0.5 hover:bg-red-100 rounded-full text-muted-foreground hover:text-red-600 transition-colors"
                      onClick={() => handleRemoveValue(index)}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {valuesList.length === 0 && (
                  <p className="text-sm text-muted-foreground italic w-full text-center py-4">
                    No values added yet.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Values</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
