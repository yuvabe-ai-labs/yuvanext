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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SocialLink {
  platform: string;
  url: string;
  id: string;
}

interface UnitSocialLinksDialogProps {
  onSave: (links: SocialLink[]) => void;
  currentLinks: SocialLink[];
  children: React.ReactNode;
}

export const UnitSocialLinksDialog: React.FC<UnitSocialLinksDialogProps> = ({
  onSave,
  currentLinks,
  children,
}) => {
  const [open, setOpen] = useState(false);
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [newLink, setNewLink] = useState<SocialLink>({
    platform: "",
    url: "",
    id: "",
  });
  const { toast } = useToast();

  // Sync state with props when dialog opens or props change
  useEffect(() => {
    setLinks(currentLinks || []);
  }, [currentLinks]);

  const platformOptions = [
    { value: "linkedin", label: "LinkedIn" },
    { value: "instagram", label: "Instagram" },
    { value: "facebook", label: "Facebook" },
    { value: "x", label: "X" },
    { value: "threads", label: "Threads" },
    { value: "website", label: "Website" }, // Added generic website option
  ];

  const addNewLink = () => {
    if (newLink.platform && newLink.url) {
      const platformExists = links.some(
        (l) => l.platform.toLowerCase() === newLink.platform.toLowerCase()
      );
      const urlExists = links.some(
        (l) => l.url.toLowerCase() === newLink.url.toLowerCase()
      );

      // Relaxed duplicate check: Allow multiple 'website' links if needed, but restrict social platforms
      if (platformExists && newLink.platform !== "website") {
        toast({
          title: "Duplicate Platform",
          description: "This platform already exists.",
          variant: "destructive",
        });
        return;
      }

      if (urlExists) {
        toast({
          title: "Duplicate URL",
          description: "This URL already exists.",
          variant: "destructive",
        });
        return;
      }

      const linkToAdd = { ...newLink, id: Date.now().toString() };
      setLinks([...links, linkToAdd]);
      setNewLink({ platform: "", url: "", id: "" });

      toast({
        title: "Success",
        description: "Link added to list (click Save to confirm)",
      });
    }
  };

  const removeLink = (id: string) => {
    setLinks(links.filter((link) => link.id !== id));
  };

  const handleSave = () => {
    onSave(links);
    setOpen(false);
  };

  const getPlatformLabel = (value: string) =>
    platformOptions.find((opt) => opt.value === value)?.label || value;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-[480px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Manage Social Links
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          {/* Existing Links */}
          {links.length > 0 && (
            <div className="space-y-3">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="grid grid-cols-5 items-center gap-2 border rounded-2xl px-3 py-2"
                >
                  <p className="font-medium col-span-1 capitalize">
                    {getPlatformLabel(link.platform)}
                  </p>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline break-all col-span-3"
                  >
                    {link.url}
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLink(link.id)}
                    className="text-muted-foreground hover:text-destructive justify-self-end"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Link */}
          <div className="space-y-4 border-t pt-4">
            <div>
              <Label htmlFor="platform">Platform *</Label>
              <Select
                value={newLink.platform}
                onValueChange={(value) =>
                  setNewLink({ ...newLink, platform: value })
                }
              >
                <SelectTrigger
                  id="platform"
                  className="rounded-full mt-1 focus:ring-2 focus:ring-primary"
                >
                  <SelectValue placeholder="Select a platform" />
                </SelectTrigger>
                <SelectContent>
                  {platformOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                type="url"
                value={newLink.url}
                onChange={(e) =>
                  setNewLink({ ...newLink, url: e.target.value })
                }
                placeholder="https://example.com"
                className="rounded-full mt-1"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setNewLink({ platform: "", url: "", id: "" })}
                className="rounded-full"
              >
                Clear
              </Button>
              <Button
                type="button"
                onClick={addNewLink}
                disabled={!newLink.platform || !newLink.url}
                className="rounded-full"
              >
                Add
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="rounded-full"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} className="rounded-full">
            Save Links
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
