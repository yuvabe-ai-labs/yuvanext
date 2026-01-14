import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Checkbox } from "@/components/ui/checkbox";

// Import Schema & Types
import {
  unitDetailsSchema,
  type UnitDetailsFormValues,
} from "@/lib/unitDialogSchemas";
import { Profile } from "@/types/profiles.types"; // Updated path based on previous context

interface UnitDetailsDialogProps {
  unitProfile?: Profile;
  onUpdateUnit: (updates: UnitDetailsFormValues) => Promise<void> | void;
  children: React.ReactNode;
}

export const UnitDetailsDialog = ({
  unitProfile,
  onUpdateUnit,
  children,
}: UnitDetailsDialogProps) => {
  const [open, setOpen] = useState(false);

  // Initialize React Hook Form
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UnitDetailsFormValues>({
    resolver: zodResolver(unitDetailsSchema),
    // Use 'values' to automatically sync form with prop changes
    values: unitProfile
      ? {
          name: unitProfile.name || "",
          type: unitProfile.type || "",
          industry: unitProfile.industry || "",
          websiteUrl: unitProfile.websiteUrl || "",
          email: unitProfile.email || "",
          phone: unitProfile.phone || "",
          address: unitProfile.address || "",
          isAurovillian: unitProfile.isAurovillian || false,
        }
      : undefined,
    defaultValues: {
      name: "",
      type: "",
      industry: "",
      websiteUrl: "",
      email: "",
      phone: "",
      address: "",
      isAurovillian: false,
    },
  });

  const onSubmit = async (data: UnitDetailsFormValues) => {
    try {
      await onUpdateUnit(data);
      setOpen(false);
    } catch (error) {
      console.error("Failed to update unit details:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Unit Details</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Unit Name */}
            <div className="col-span-2">
              <Label htmlFor="name">Unit Name</Label>
              <Input
                id="name"
                placeholder="Enter unit name"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Unit Type (Controlled) */}
            <div>
              <Label htmlFor="type">Unit Type</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
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
                )}
              />
            </div>

            {/* Industry */}
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                placeholder="e.g., Technology, Education"
                {...register("industry")}
              />
            </div>

            {/* Website URL */}
            <div className="col-span-2">
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input
                id="websiteUrl"
                type="url"
                placeholder="https://example.com"
                {...register("websiteUrl")}
              />
              {errors.websiteUrl && (
                <p className="text-sm text-destructive mt-1">
                  {errors.websiteUrl.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Contact Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone">Contact Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 123 456 7890"
                {...register("phone")}
              />
            </div>

            {/* Address */}
            <div className="col-span-2">
              <Label htmlFor="address">Location</Label>
              <Input
                id="address"
                placeholder="Full address"
                {...register("address")}
              />
            </div>

            {/* Aurovillian Checkbox (Controlled) */}
            <div className="col-span-2">
              <Controller
                name="isAurovillian"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isAurovillian"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <Label htmlFor="isAurovillian" className="cursor-pointer">
                      Is Aurovillian Unit
                    </Label>
                  </div>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
