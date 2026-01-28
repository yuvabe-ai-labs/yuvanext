import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      language: (profile?.language ?? []).map(l => ({
        name: l.name,
        read: l.read || false,
        write: l.write || false,
        speak: l.speak || false,
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "language",
  });

  const onSubmit = async (data: PersonalDetailsForm) => {
    try {
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

        <Form {...form}>
          <ScrollArea className="flex-1 overflow-y-auto pr-4 mt-2">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input className="rounded-full" placeholder="Enter Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input className="rounded-full" placeholder="Enter Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input className="rounded-full" type="email" placeholder="email@gmail.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact details</FormLabel>
                      <FormControl>
                        <Input className="rounded-full" placeholder="+91 98765 43210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-full">
                          <SelectValue placeholder="Select Location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LOCATIONS.map((loc) => (
                          <SelectItem key={loc} value={loc.toLowerCase()}>{loc}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex gap-3 mt-2"
                      >
                        {[
                          { value: Gender.MALE, label: "Male" },
                          { value: Gender.FEMALE, label: "Female" },
                          { value: Gender.PREFER_NOT_SAY, label: "Prefer not to say" },
                        ].map((item) => (
                          <div key={item.value} className="flex items-center">
                            <RadioGroupItem value={item.value} id={item.value} className="peer sr-only" />
                            <Label
                              htmlFor={item.value}
                              className="px-4 py-2 rounded-full border cursor-pointer peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground text-sm"
                            >
                              {item.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4 border-t"><h3 className="font-semibold mb-2">More Information</h3></div>

              <FormField
                control={form.control}
                name="marital_status"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Marital status</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-wrap gap-3 mt-2"
                      >
                        {MARITAL_STATUS_OPTIONS.map((status) => (
                          <div key={status.value} className="flex items-center">
                            <RadioGroupItem value={status.value} id={status.value} className="peer sr-only" />
                            <Label
                              htmlFor={status.value}
                              className="px-4 py-2 rounded-full border cursor-pointer peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground text-sm"
                            >
                              {status.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label>Date Of Birth</Label>
                <div className="grid grid-cols-3 gap-3">
                  <FormField
                    control={form.control}
                    name="birth_date"
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-full">
                              <SelectValue placeholder="Date" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 31 }, (_, i) => String(i + 1)).map(d => (
                              <SelectItem key={d} value={d}>{d}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="birth_month"
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-full">
                              <SelectValue placeholder="Month" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m, i) => (
                              <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="birth_year"
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-full">
                              <SelectValue placeholder="Year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 100 }, (_, i) => String(new Date().getFullYear() - i)).map(y => (
                              <SelectItem key={y} value={y}>{y}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Language Proficiency</Label>
                {fields.map((field, index) => (
                  <div key={field.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 border rounded-xl bg-muted/30">
                    <div className="flex-1 w-full">
                      <FormField
                        control={form.control}
                        name={`language.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="rounded-full bg-background">
                                  <SelectValue placeholder="Select Language" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {AVAILABLE_LANGUAGES.map(lang => (
                                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex gap-4 sm:gap-6">
                      {["read", "write", "speak"].map((mode) => (
                        <FormField
                          key={mode}
                          control={form.control}
                          name={`language.${index}.${mode}` as any}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-xs font-normal capitalize cursor-pointer">
                                {mode}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => remove(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => append({ name: "", read: false, write: false, speak: false })} 
                  className="rounded-full"
                >
                  + Add language
                </Button>
                {form.formState.errors.language && (
                  <p className="text-sm text-destructive">{form.formState.errors.language.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-full">Cancel</Button>
                <Button type="submit" disabled={isPending} className="rounded-full">
                  {isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </ScrollArea>
        </Form>
      </DialogContent>
    </Dialog>
  );
};