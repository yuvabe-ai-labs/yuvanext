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
import { Trash2, Plus } from "lucide-react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  socialLinkSchema,
  SocialLinksFormValues,
} from "@/lib/unitDialogSchemas";
import { SocialLink } from "@/types/profiles.types";

interface UnitSocialLinksDialogProps {
  onSave: (links: SocialLink[]) => void;
  currentLinks: SocialLink[];
  children: React.ReactNode;
}

const PLATFORM_OPTIONS = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "github", label: "GitHub" },
  { value: "twitter", label: "Twitter" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "x", label: "X" },
  { value: "threads", label: "Threads" },
  { value: "website", label: "Website" },
];

export const UnitSocialLinksDialog: React.FC<UnitSocialLinksDialogProps> = ({
  onSave,
  currentLinks,
  children,
}) => {
  const [open, setOpen] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SocialLinksFormValues>({
    resolver: zodResolver(socialLinkSchema),
    defaultValues: {
      links: currentLinks || [],
    },
  });

  useEffect(() => {
    if (open) {
      reset({ links: currentLinks || [] });
    }
  }, [open, currentLinks, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "links",
  });

  const onSubmit = (data: SocialLinksFormValues) => {
    const formattedLinks: SocialLink[] = data.links.map((link) => ({
      id: link.id,
      platform: link.platform,
      url: link.url,
    }));

    onSave(formattedLinks);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="max-w-[550px] rounded-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Manage Social Links
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-2">
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-12 gap-3 items-start border p-3 rounded-xl bg-gray-50/50"
              >
                {/* Platform Select */}
                <div className="col-span-4">
                  <Label className="text-xs text-muted-foreground mb-1 block">
                    Platform
                  </Label>
                  <Controller
                    control={control}
                    name={`links.${index}.platform`}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="bg-white h-9">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {PLATFORM_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.links?.[index]?.platform && (
                    <p className="text-[10px] text-red-500 mt-1">Required</p>
                  )}
                </div>

                {/* URL Input */}
                <div className="col-span-7">
                  <Label className="text-xs text-muted-foreground mb-1 block">
                    URL
                  </Label>
                  <Input
                    {...register(`links.${index}.url`)}
                    placeholder="https://..."
                    className="bg-white h-9"
                  />
                  {errors.links?.[index]?.url && (
                    <p className="text-[10px] text-red-500 mt-1">Invalid URL</p>
                  )}
                </div>

                {/* Remove Button */}
                <div className="col-span-1 flex items-end h-full pb-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {fields.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed rounded-xl text-muted-foreground text-sm">
              No social links added yet.
            </div>
          )}

          {/* Add Button */}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              append({
                platform: "",
                url: "",
                id: `temp-${Date.now()}`,
              })
            }
            className="w-full border-dashed gap-2"
          >
            <Plus className="w-4 h-4" /> Add Social Link
          </Button>

          {/* Footer Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button type="submit" className="rounded-full">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
