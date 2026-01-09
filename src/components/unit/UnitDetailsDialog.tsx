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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UnitDetailsDialogProps {
  // We accept both for compatibility, but they likely point to the same object now
  profile: any;
  unitProfile: any;
  onUpdate: (updates: any) => void;
  onUpdateUnit: (updates: any) => void;
  children: React.ReactNode;
}

export const UnitDetailsDialog = ({
  profile,
  unitProfile,
  onUpdate,
  onUpdateUnit,
  children,
}: UnitDetailsDialogProps) => {
  const [open, setOpen] = useState(false);

  // Use camelCase from your new API response
  const [formData, setFormData] = useState({
    name: unitProfile?.name || profile?.name || "",
    type: unitProfile?.type || "",
    industry: unitProfile?.industry || "",
    websiteUrl: unitProfile?.websiteUrl || "",
    email: unitProfile?.email || profile?.email || "",
    phone: unitProfile?.phone || profile?.phone || "",
    address: unitProfile?.address || "",
    isAurovillian: unitProfile?.isAurovillian || false,
  });

  // Update local state when props change (e.g. after a fetch)
  useEffect(() => {
    if (unitProfile) {
      setFormData({
        name: unitProfile.name || "",
        type: unitProfile.type || "",
        industry: unitProfile.industry || "",
        websiteUrl: unitProfile.websiteUrl || "",
        email: unitProfile.email || "",
        phone: unitProfile.phone || "",
        address: unitProfile.address || "",
        isAurovillian: unitProfile.isAurovillian || false,
      });
    }
  }, [unitProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Send updated fields. The new API likely handles partial updates to the single profile object.
    const updates = {
      name: formData.name,
      type: formData.type,
      industry: formData.industry,
      websiteUrl: formData.websiteUrl,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      isAurovillian: formData.isAurovillian,
    };

    // Call the update handler (React Query mutation from parent)
    await onUpdateUnit(updates);

    setOpen(false);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Unit Details</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Unit Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter unit name"
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Unit Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Startup">Startup</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                  <SelectItem value="Cultural">Cultural</SelectItem>
                  <SelectItem value="Educational">Educational</SelectItem>
                  <SelectItem value="Service">Service</SelectItem>
                  <SelectItem value="Community">Community</SelectItem>
                  <SelectItem value="Farm">Farm</SelectItem>
                  <SelectItem value="Forest">Forest</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => handleChange("industry", e.target.value)}
                placeholder="e.g., Technology, Education"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input
                id="websiteUrl"
                type="url"
                value={formData.websiteUrl}
                onChange={(e) => handleChange("websiteUrl", e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <div>
              <Label htmlFor="email">Contact Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="contact@example.com"
              />
            </div>

            <div>
              <Label htmlFor="phone">Contact Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+91 123 456 7890"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="address">Location</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Full address"
              />
            </div>

            <div className="col-span-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isAurovillian"
                  checked={formData.isAurovillian}
                  onChange={(e) =>
                    handleChange("isAurovillian", e.target.checked)
                  }
                  className="w-4 h-4 rounded border-gray-300"
                />
                <Label htmlFor="isAurovillian" className="cursor-pointer">
                  Is Aurovillian Unit
                </Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
