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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UnitDetailsDialogProps {
  profile: any;
  unitProfile: any;
  onUpdate: (updates: any) => Promise<void>;
  onUpdateUnit: (updates: any) => Promise<void>;
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
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    unit_name: unitProfile?.unit_name || "",
    unit_type: unitProfile?.unit_type || "",
    industry: unitProfile?.industry || "",
    website_url: unitProfile?.website_url || "",
    contact_email: unitProfile?.contact_email || "",
    contact_phone: unitProfile?.contact_phone || "",
    address: unitProfile?.address || "",
    is_aurovillian: unitProfile?.is_aurovillian || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Update profile table
    await onUpdate({
      full_name: formData.full_name,
    });

    // Update units table
    await onUpdateUnit({
      unit_name: formData.unit_name,
      unit_type: formData.unit_type,
      industry: formData.industry,
      website_url: formData.website_url,
      contact_email: formData.contact_email,
      contact_phone: formData.contact_phone,
      address: formData.address,
      is_aurovillian: formData.is_aurovillian,
    });

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
              <Label htmlFor="unit_name">Unit Name</Label>
              <Input
                id="unit_name"
                value={formData.unit_name}
                onChange={(e) => handleChange("unit_name", e.target.value)}
                placeholder="Enter unit name"
                required
              />
            </div>

            <div>
              <Label htmlFor="unit_type">Unit Type</Label>
              <Select
                value={formData.unit_type}
                onValueChange={(value) => handleChange("unit_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
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
              <Label htmlFor="website_url">Website URL</Label>
              <Input
                id="website_url"
                type="url"
                value={formData.website_url}
                onChange={(e) => handleChange("website_url", e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <div>
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => handleChange("contact_email", e.target.value)}
                placeholder="contact@example.com"
              />
            </div>

            <div>
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input
                id="contact_phone"
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => handleChange("contact_phone", e.target.value)}
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
                  id="is_aurovillian"
                  checked={formData.is_aurovillian}
                  onChange={(e) =>
                    handleChange("is_aurovillian", e.target.checked)
                  }
                  className="w-4 h-4 rounded border-gray-300"
                />
                <Label htmlFor="is_aurovillian" className="cursor-pointer">
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
