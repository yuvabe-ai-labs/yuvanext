import { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { Profile, Language, Gender, MaritalStatus, UpdateProfilePayload } from "@/types/profiles.types";
import { useUpdateProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { personalDetailsSchema } from "@/lib/schemas";

type PersonalDetailsForm = z.infer<typeof personalDetailsSchema>;

interface PersonalDetailsDialogProps {
  profile: Profile | null | undefined;
  onUpdate: () => void;
  children: React.ReactNode;
}

const LOCATIONS = ["Auroville", "Pondicherry", "Tamil Nadu", "Other"];

const MARITAL_STATUS_OPTIONS = [
  { value: MaritalStatus.SINGLE, label: "Single" },
  { value: MaritalStatus.MARRIED, label: "Married" },
  { value: MaritalStatus.PREFER_NOT_TO_SAY, label: "Prefer not to say" },
];

const AVAILABLE_LANGUAGES = [
  "English", "Hindi", "Tamil", "French", "Spanish", 
  "German", "Mandarin", "Arabic", "Portuguese", "Russian",
];

export const PersonalDetailsDialog = ({
  profile,
  onUpdate,
  children,
}: PersonalDetailsDialogProps) => {
  const [open, setOpen] = useState(false);
  const { mutateAsync: updateProfileMutation, isPending } = useUpdateProfile();
  const { toast } = useToast();

  const nameParts = profile?.name?.split(" ") ?? [""];
  const dateOfBirthObj = profile?.dateOfBirth ? new Date(profile.dateOfBirth) : null;

  const form = useForm<PersonalDetailsForm>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      first_name: nameParts[0] || "",
      last_name: nameParts.slice(1).join(" ") || "",
      email: profile?.email ?? "",
      phone: profile?.phone ?? "",
      location: profile?.location ?? "",
      gender: profile?.gender as Gender,
      marital_status: profile?.maritalStatus as MaritalStatus,
      birth_date: dateOfBirthObj ? String(dateOfBirthObj.getDate()) : "",
      birth_month: dateOfBirthObj ? String(dateOfBirthObj.getMonth() + 1) : "",
      birth_year: dateOfBirthObj ? String(dateOfBirthObj.getFullYear()) : "",
      is_differently_abled: profile?.isDifferentlyAbled ?? false,
      has_career_break: profile?.hasCareerBreak ?? false,
      language: profile?.language ?? [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "language",
  });

  const [languageError, setLanguageError] = useState<string | null>(null);

  const onSubmit = async (data: PersonalDetailsForm) => {
    try {
      // Manual Validation for duplicates/proficiency as per original logic
      if (data.language && data.language.length > 0) {
        const names = data.language.map(l => l.name).filter(Boolean);
        if (new Set(names).size !== names.length) {
          setLanguageError("Duplicate languages found.");
          return;
        }
        if (data.language.some(l => !l.read && !l.write && !l.speak)) {
          setLanguageError("Select at least one proficiency per language.");
          return;
        }
      }
      setLanguageError(null);

      const fullName = `${data.first_name} ${data.last_name || ""}`.trim();
      let dateOfBirth: string | null = null;
      if (data.birth_date && data.birth_month && data.birth_year) {
        const date = new Date(
          parseInt(data.birth_year),
          parseInt(data.birth_month) - 1,
          parseInt(data.birth_date)
        );
        dateOfBirth = date.toISOString();
      }

      const payload: UpdateProfilePayload = {
        name: fullName,
        phone: data.phone || null,
        location: data.location || null,
        gender: data.gender,
        maritalStatus: data.marital_status,
        dateOfBirth: dateOfBirth,
        isDifferentlyAbled: data.is_differently_abled,
        hasCareerBreak: data.has_career_break,
        language: data.language as Language[],
      };

      await updateProfileMutation(payload);
      toast({ title: "Success", description: "Personal details updated successfully" });
      onUpdate();
      setOpen(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Personal Details</DialogTitle>
          <p className="text-sm text-muted-foreground">
            This information is important for employers to know you better
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 overflow-y-auto pr-4 mt-2">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input className="rounded-full" id="first_name" placeholder="Enter Name" {...form.register("first_name")} />
                {form.formState.errors.first_name && <p className="text-sm text-red-500">{form.formState.errors.first_name.message}</p>}
              </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input id="last_name" className="rounded-full" placeholder="Enter Name" {...form.register("last_name")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input id="email" className="rounded-full" type="email" placeholder="email@gmail.com" {...form.register("email")} />
              </div>
              <div>
                <Label htmlFor="phone">Contact details</Label>
                <Input id="phone" className="rounded-full" placeholder="+91 98765 43210" {...form.register("phone")} />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Controller
                name="location"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select Location" /></SelectTrigger>
                    <SelectContent>
                      {LOCATIONS.map((loc) => <SelectItem key={loc} value={loc.toLowerCase()}>{loc}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <Label>Gender</Label>
              <Controller
                name="gender"
                control={form.control}
                render={({ field }) => (
                  <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-3 mt-2">
                    <div className="flex items-center">
                      <RadioGroupItem value={Gender.MALE} id="male" className="peer sr-only" />
                      <Label htmlFor="male" className="px-4 py-2 rounded-full border cursor-pointer peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground">Male</Label>
                    </div>
                    <div className="flex items-center">
                      <RadioGroupItem value={Gender.FEMALE} id="female" className="peer sr-only" />
                      <Label htmlFor="female" className="px-4 py-2 rounded-full border cursor-pointer peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground">Female</Label>
                    </div>
                    <div className="flex items-center">
                      <RadioGroupItem value={Gender.PREFER_NOT_SAY} id="prefer_not_say" className="peer sr-only" />
                      <Label htmlFor="prefer_not_say" className="px-4 py-2 rounded-full border cursor-pointer peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground">Prefer not to say</Label>
                    </div>
                  </RadioGroup>
                )}
              />
            </div>

            <div className="pt-4"><h3 className="font-semibold mb-2">More Information</h3></div>

            <div>
              <Label>Marital status</Label>
              <Controller
                name="marital_status"
                control={form.control}
                render={({ field }) => (
                  <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-wrap gap-3 mt-2">
                    {MARITAL_STATUS_OPTIONS.map((status) => (
                      <div key={status.value} className="flex items-center">
                        <RadioGroupItem value={status.value} id={status.value} className="peer sr-only" />
                        <Label htmlFor={status.value} className="px-4 py-2 rounded-full border cursor-pointer peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground text-sm">{status.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              />
            </div>

            <div>
              <Label>Date Of Birth</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                <Controller name="birth_date" control={form.control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue placeholder="Date" /></SelectTrigger><SelectContent>{Array.from({ length: 31 }, (_, i) => String(i + 1)).map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>
                )} />
                <Controller name="birth_month" control={form.control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue placeholder="Month" /></SelectTrigger><SelectContent>{["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m, i) => <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>)}</SelectContent></Select>
                )} />
                <Controller name="birth_year" control={form.control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger><SelectContent>{Array.from({ length: 100 }, (_, i) => String(new Date().getFullYear() - i)).map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select>
                )} />
              </div>
            </div>

            <div>
              <Label className="mb-4 block">Language Proficiency</Label>
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-4 justify-between mb-4">
                  <div className="flex-1">
                    <Controller
                      name={`language.${index}.name`}
                      control={form.control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger><SelectValue placeholder="Select Language" /></SelectTrigger>
                          <SelectContent>{AVAILABLE_LANGUAGES.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}</SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="flex gap-6">
                    {["read", "write", "speak"].map((mode) => (
                      <div key={mode} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${mode}-${index}`}
                          checked={form.watch(`language.${index}.${mode}` as any)}
                          onCheckedChange={(val) => form.setValue(`language.${index}.${mode}` as any, !!val)}
                        />
                        <Label htmlFor={`${mode}-${index}`}>{mode.charAt(0).toUpperCase() + mode.slice(1)}</Label>
                      </div>
                    ))}
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}><X className="w-4 h-4" /></Button>
                </div>
              ))}
              <Button type="button" variant="link" onClick={() => append({ name: "", read: false, write: false, speak: false })} className="p-0">Add another language</Button>
              {languageError && <p className="text-sm text-red-500 mt-2">{languageError}</p>}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-full">Cancel</Button>
              <Button type="submit" disabled={isPending} className="rounded-full">{isPending ? "Saving..." : "Save"}</Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};