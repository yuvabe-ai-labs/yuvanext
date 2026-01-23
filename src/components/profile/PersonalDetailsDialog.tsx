import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
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
import { Profile, Language } from "@/types/profiles.types";
import { useUpdateProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

const personalDetailsSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  location: z.string().optional(),
  gender: z.string().optional(),
  marital_status: z.string().optional(),
  birth_date: z.string().optional(),
  birth_month: z.string().optional(),
  birth_year: z.string().optional(),
  is_differently_abled: z.boolean().optional(),
  has_career_break: z.boolean().optional(),
});

type PersonalDetailsForm = z.infer<typeof personalDetailsSchema>;

interface PersonalDetailsDialogProps {
  profile: Profile | null | undefined;
  onUpdate: () => void;
  children: React.ReactNode;
}

const LOCATIONS = ["Auroville", "Pondicherry", "Tamil Nadu", "Other"];
const MARITAL_STATUS_OPTIONS = [
  "Single/Unmarried",
  "Married",
  "Divorced",
  "Widowed",
  "Prefer not to say",
];

const AVAILABLE_LANGUAGES = [
  "English",
  "Hindi",
  "Tamil",
  "French",
  "Spanish",
  "German",
  "Mandarin",
  "Arabic",
  "Portuguese",
  "Russian",
];

export const PersonalDetailsDialog = ({
  profile,
  onUpdate,
  children,
}: PersonalDetailsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [languageError, setLanguageError] = useState<string | null>(null);

  const { mutateAsync: updateProfileMutation, isPending } = useUpdateProfile();
  const { toast } = useToast();

  // Split name into first and last name
  const nameParts = profile?.name?.split(" ") || [""];
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  // Parse date of birth
  const dateOfBirth = profile?.dateOfBirth
    ? new Date(profile.dateOfBirth)
    : null;
  const birthDate = dateOfBirth ? String(dateOfBirth.getDate()) : "";
  const birthMonth = dateOfBirth ? String(dateOfBirth.getMonth() + 1) : "";
  const birthYear = dateOfBirth ? String(dateOfBirth.getFullYear()) : "";

  // Parse languages from profile
  const parseLanguages = (langs: any): Language[] => {
    if (!langs) return [];

    // If it's already an array of Language objects, return it
    if (Array.isArray(langs)) {
      // Check if items are already objects
      if (langs.length > 0 && typeof langs[0] === "object" && langs[0].id) {
        return langs;
      }

      // If items are JSON strings, parse them
      return langs
        .map((lang) => {
          if (typeof lang === "string") {
            try {
              return JSON.parse(lang);
            } catch {
              return null;
            }
          }
          return lang;
        })
        .filter(Boolean);
    }

    // If it's a string, try to parse it
    if (typeof langs === "string") {
      try {
        const parsed = JSON.parse(langs);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    return [];
  };

  useEffect(() => {
    if (open) {
      const parsedLanguages = parseLanguages(profile?.language);
      setLanguages(parsedLanguages.length > 0 ? parsedLanguages : []);
    }
  }, [open, profile?.language]);

  const form = useForm<PersonalDetailsForm>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      first_name: firstName,
      last_name: lastName,
      email: profile?.email || "",
      phone: profile?.phone || "",
      location: profile?.location || "",
      gender: profile?.gender || "",
      marital_status: profile?.maritalStatus || "",
      birth_date: birthDate,
      birth_month: birthMonth,
      birth_year: birthYear,
      is_differently_abled: profile?.isDifferentlyAbled || false,
      has_career_break: profile?.hasCareerBreak || false,
    },
  });

  const addLanguage = () => {
    setLanguages([
      ...languages,
      {
        id: crypto.randomUUID(),
        name: "",
        read: false,
        write: false,
        speak: false,
      },
    ]);
  };

  const updateLanguage = (id: string, field: keyof Language, value: any) => {
    setLanguages(
      languages.map((lang) =>
        lang.id === id ? { ...lang, [field]: value } : lang,
      ),
    );
  };

  const removeLanguage = (id: string) => {
    setLanguages(languages.filter((lang) => lang.id !== id));
    setLanguageError(null);
  };

  const onSubmit = async (data: PersonalDetailsForm) => {
    try {
      // Combine first and last name
      const fullName = `${data.first_name} ${data.last_name || ""}`.trim();

      // Construct date of birth from separate fields
      let dateOfBirth: string | null = null;
      if (data.birth_date && data.birth_month && data.birth_year) {
        const date = new Date(
          parseInt(data.birth_year),
          parseInt(data.birth_month) - 1,
          parseInt(data.birth_date),
        );
        dateOfBirth = date.toISOString();
      }

      if (languages.length > 0) {
        const languageNames = languages.map((l) => l.name).filter(Boolean);
        const duplicates = languageNames.filter(
          (name, index) => languageNames.indexOf(name) !== index,
        );

        const emptyLanguages = languages.filter(
          (lang) => !lang.name || lang.name.trim() === "",
        );

        if (duplicates.length > 0) {
          setLanguageError(
            `${duplicates[0]} language added more than once. Please remove or update it.`,
          );
          return;
        } else if (emptyLanguages.length > 0) {
          setLanguageError("Please select a language before saving.");
          return;
        }

        // Validate that at least one proficiency is selected
        const invalidLanguages = languages.filter(
          (lang) => lang.name && !lang.read && !lang.write && !lang.speak,
        );

        if (invalidLanguages.length > 0) {
          setLanguageError(
            "Please select at least one proficiency (Read, Write, or Speak) for each language.",
          );
          return;
        }
      }

      setLanguageError(null);

      await updateProfileMutation({
        name: fullName,
        phone: data.phone || null,
        location: data.location || null,
        gender: data.gender || null,
        maritalStatus: data.marital_status || null,
        dateOfBirth: dateOfBirth,
        isDifferentlyAbled: data.is_differently_abled || false,
        hasCareerBreak: data.has_career_break || false,
        // Send languages as array of JSON strings (API expects string[])
        language:
          languages.length > 0
            ? languages.map((lang) => JSON.stringify(lang))
            : [],
      });

      toast({
        title: "Success",
        description: "Personal details updated successfully",
      });

      onUpdate();
      setOpen(false);
    } catch (error) {
      console.error("Error updating personal details:", error);
      toast({
        title: "Error",
        description: "Failed to update personal details",
        variant: "destructive",
      });
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
            {/* First Name & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  className="rounded-full"
                  id="first_name"
                  placeholder="Enter Name"
                  {...form.register("first_name")}
                  onChange={(e) => {
                    const value = e.target.value;
                    const formatted =
                      value.charAt(0).toUpperCase() +
                      value.slice(1).toLowerCase();
                    form.setValue("first_name", formatted);
                  }}
                />
                {form.formState.errors.first_name && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.first_name.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  className="rounded-full"
                  placeholder="Enter Name"
                  {...form.register("last_name")}
                  onChange={(e) => {
                    const value = e.target.value;
                    const formatted =
                      value.charAt(0).toUpperCase() +
                      value.slice(1).toLowerCase();
                    form.setValue("last_name", formatted);
                  }}
                />
                {form.formState.errors.last_name && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.last_name.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email & Contact Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  className="rounded-full"
                  type="email"
                  placeholder="email@gmail.com"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Contact details</Label>
                <Input
                  id="phone"
                  className="rounded-full"
                  placeholder="Example: +91 98765 43210"
                  {...form.register("phone")}
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location">Location</Label>
              <Select
                value={form.watch("location")}
                onValueChange={(value) => form.setValue("location", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Location" />
                </SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((location) => (
                    <SelectItem key={location} value={location.toLowerCase()}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Gender */}
            <div>
              <Label>Gender</Label>
              <Controller
                name="gender"
                control={form.control}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex gap-3 mt-2"
                  >
                    <div className="flex items-center">
                      <RadioGroupItem
                        value="Male"
                        id="male"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="male"
                        className="px-4 py-2 rounded-full border cursor-pointer peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground"
                      >
                        Male
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <RadioGroupItem
                        value="Female"
                        id="female"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="female"
                        className="px-4 py-2 rounded-full border cursor-pointer peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground"
                      >
                        Female
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <RadioGroupItem
                        value="Other"
                        id="other"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="other"
                        className="px-4 py-2 rounded-full border cursor-pointer peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground"
                      >
                        Other
                      </Label>
                    </div>
                  </RadioGroup>
                )}
              />
            </div>

            {/* More Information Section */}
            <div className="pt-4">
              <h3 className="font-semibold mb-2">More Information</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Companies are focusing on equal opportunities and might be
                looking for candidates from diverse backgrounds
              </p>
            </div>

            {/* Marital Status */}
            <div>
              <Label>Marital status</Label>
              <Controller
                name="marital_status"
                control={form.control}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="flex flex-wrap gap-3 mt-2"
                  >
                    {MARITAL_STATUS_OPTIONS.map((status) => (
                      <div key={status} className="flex items-center">
                        <RadioGroupItem
                          value={status}
                          id={status}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={status}
                          className="px-4 py-2 rounded-full border cursor-pointer peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground text-sm"
                        >
                          {status}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              />
            </div>

            {/* Date of Birth */}
            <div>
              <Label>Date Of Birth</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                <Select
                  value={form.watch("birth_date")}
                  onValueChange={(value) => form.setValue("birth_date", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={String(day)}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={form.watch("birth_month")}
                  onValueChange={(value) => form.setValue("birth_month", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                    ].map((month, idx) => (
                      <SelectItem key={month} value={String(idx + 1)}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={form.watch("birth_year")}
                  onValueChange={(value) => form.setValue("birth_year", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(
                      { length: 100 },
                      (_, i) => new Date().getFullYear() - i,
                    ).map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Differently Abled */}
            <div>
              <Label>Are you differently abled?</Label>
              <Controller
                name="is_differently_abled"
                control={form.control}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value ? "true" : "false"}
                    onValueChange={(value) => field.onChange(value === "true")}
                    className="flex gap-3 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="differently-abled-yes" />
                      <Label htmlFor="differently-abled-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="differently-abled-no" />
                      <Label htmlFor="differently-abled-no">No</Label>
                    </div>
                  </RadioGroup>
                )}
              />
            </div>

            {/* Career Break */}
            <div>
              <Label>Have you taken any career break?</Label>
              <Controller
                name="has_career_break"
                control={form.control}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value ? "true" : "false"}
                    onValueChange={(value) => field.onChange(value === "true")}
                    className="flex gap-3 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="career-break-yes" />
                      <Label htmlFor="career-break-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="career-break-no" />
                      <Label htmlFor="career-break-no">No</Label>
                    </div>
                  </RadioGroup>
                )}
              />
            </div>

            {/* Language Proficiency */}
            <div>
              <Label className="mb-4 block">Language Proficiency</Label>
              {languages.map((language) => (
                <div
                  key={language.id}
                  className="flex items-center gap-4 justify-between mb-4 rounded-lg"
                >
                  <div className="flex-1">
                    <Select
                      value={language.name}
                      onValueChange={(value) => {
                        updateLanguage(language.id, "name", value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Language" />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_LANGUAGES.map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {lang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        disabled={!language.name}
                        id={`read-${language.id}`}
                        checked={language.read}
                        onCheckedChange={(checked) =>
                          updateLanguage(
                            language.id,
                            "read",
                            checked as boolean,
                          )
                        }
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                      />
                      <Label htmlFor={`read-${language.id}`}>Read</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        disabled={!language.name}
                        id={`write-${language.id}`}
                        checked={language.write}
                        onCheckedChange={(checked) =>
                          updateLanguage(
                            language.id,
                            "write",
                            checked as boolean,
                          )
                        }
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                      />
                      <Label htmlFor={`write-${language.id}`}>Write</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        disabled={!language.name}
                        id={`speak-${language.id}`}
                        checked={language.speak}
                        onCheckedChange={(checked) =>
                          updateLanguage(
                            language.id,
                            "speak",
                            checked as boolean,
                          )
                        }
                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                      />
                      <Label htmlFor={`speak-${language.id}`}>Speak</Label>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLanguage(language.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="link"
                className="text-primary p-0"
                onClick={addLanguage}
              >
                Add another language
              </Button>
              {languageError && (
                <p className="text-sm text-red-500 mt-2">{languageError}</p>
              )}
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
                type="submit"
                disabled={isPending}
                className="rounded-full"
              >
                {isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
