import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
// RHF Imports
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { X, Sparkles, ChevronDown, Loader2 } from "lucide-react";
import { format } from "date-fns";

// 1. IMPORT HOOKS
import { useUpdateInternship } from "@/hooks/useInternships";
import { useGenerateContent } from "@/hooks/useAI"; // Added this
import type { Internship } from "@/types/internships.types";
import { AISectionType } from "@/types/ai.types"; // Added this

// Schema
import {
  internshipSchema,
  type InternshipFormValues,
} from "@/lib/EditInternshipDialogSchema";

interface EditInternshipDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  internship: Internship | null;
}

const LANGUAGES = [
  "English",
  "Hindi",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Marathi",
  "Bengali",
  "Gujarati",
  "Punjabi",
  "Urdu",
  "French",
  "Spanish",
  "German",
  "Mandarin",
  "Japanese",
  "Korean",
];

const EditInternshipDialog: React.FC<EditInternshipDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  internship,
}) => {
  const { toast } = useToast();

  // Hooks
  const updateInternshipMutation = useUpdateInternship();
  const generateContentMutation = useGenerateContent(); // Use the correct AI hook

  const [aiLoading, setAiLoading] = useState<string | null>(null);

  // Removed conversationHistory state as it's not needed for the new endpoint

  // Date Picker Local State (UI Only)
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const months = [
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
  ];
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);

  // --- RHF SETUP ---
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<InternshipFormValues>({
    resolver: zodResolver(internshipSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      duration: "",
      isPaid: false,
      payment: "",
      description: "",
      responsibilities: "",
      benefits: "",
      skills_required: "",
      language_requirements: [
        { language: "", read: false, write: false, speak: false },
      ],
      application_deadline: undefined,
      min_age_required: undefined,
      job_type: "full_time",
    },
  });

  // Use Field Array for Dynamic Languages
  const { fields, append, remove } = useFieldArray({
    control,
    name: "language_requirements",
  });

  const isPaid = watch("isPaid");
  const jobTitle = watch("title");
  const isJobRoleFilled = jobTitle && jobTitle.trim().length > 0;

  // --- DATE HELPERS ---
  const isDateDisabled = (date: number, month: string, year: string) => {
    if (!month || !year) return false;
    const selectedTimestamp = new Date(
      parseInt(year),
      parseInt(month) - 1,
      date
    ).setHours(0, 0, 0, 0);
    const todayTimestamp = new Date().setHours(0, 0, 0, 0);
    return selectedTimestamp < todayTimestamp;
  };

  const getAvailableDates = () => {
    if (!selectedMonth || !selectedYear)
      return Array.from({ length: 31 }, (_, i) => i + 1);
    const year = parseInt(selectedYear);
    const month = parseInt(selectedMonth);
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const getAvailableMonths = () => {
    if (!selectedYear) return months;
    const year = parseInt(selectedYear);
    if (year > currentYear) return months;
    return months.slice(currentMonth - 1);
  };

  const dates = getAvailableDates();
  const availableMonths = getAvailableMonths();

  // --- POPULATE FORM ---
  useEffect(() => {
    if (internship && isOpen) {
      const joinArray = (val: string[] | string | undefined) =>
        Array.isArray(val) ? val.join("\n") : val || "";

      let languageReqs = [
        { language: "", read: false, write: false, speak: false },
      ];

      if (
        Array.isArray(internship.language) &&
        internship.language.length > 0
      ) {
        if (typeof internship.language[0] === "string") {
          languageReqs = internship.language.map((lang) => ({
            language: lang,
            read: true,
            write: true,
            speak: true,
          }));
        } else {
          languageReqs = internship.language;
        }
      }

      const closingDateVal = internship.closingDate;
      if (closingDateVal) {
        const deadline = new Date(closingDateVal);
        setSelectedDate(deadline.getDate().toString());
        setSelectedMonth((deadline.getMonth() + 1).toString());
        setSelectedYear(deadline.getFullYear().toString());
      }

      reset({
        title: internship.title || "",
        duration: internship.duration || "",
        isPaid: internship.isPaid,
        payment: internship.payment || "",
        description: internship.description || "",
        responsibilities: joinArray(internship.responsibilities),
        benefits: joinArray(internship.benefits),
        skills_required: joinArray(internship.skillsRequired),
        language_requirements: languageReqs,
        application_deadline: closingDateVal
          ? new Date(closingDateVal)
          : undefined,
        min_age_required: Number(internship.minAgeRequired) || undefined,
        job_type: internship.jobType || "full_time",
      });
    }
  }, [internship, isOpen, reset]);

  // Sync Date Dropdowns to Form
  useEffect(() => {
    if (selectedDate && selectedMonth && selectedYear) {
      const date = new Date(
        parseInt(selectedYear),
        parseInt(selectedMonth) - 1,
        parseInt(selectedDate)
      );
      if (date.setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0)) {
        setValue("application_deadline", date, { shouldValidate: true });
      }
    }
  }, [selectedDate, selectedMonth, selectedYear, setValue]);

  useEffect(() => {
    if (selectedDate && selectedMonth && selectedYear) {
      if (isDateDisabled(parseInt(selectedDate), selectedMonth, selectedYear)) {
        setSelectedDate("");
      }
    }
  }, [selectedMonth, selectedYear]);

  // --- SUBMIT ---
  const onSubmit = async (data: InternshipFormValues) => {
    if (!internship) return;

    const skillsArray = data.skills_required
      .split("\n")
      .filter((s) => s.trim());
    const responsibilitiesArray = data.responsibilities
      .split("\n")
      .filter((r) => r.trim());
    const benefitsArray = data.benefits.split("\n").filter((b) => b.trim());
    const paymentValue = data.isPaid && data.payment ? data.payment : "Unpaid";
    const languageArray = data.language_requirements.map((l) => l.language);

    updateInternshipMutation.mutate(
      {
        id: internship.id,
        title: data.title,
        duration: data.duration,
        isPaid: data.isPaid,
        payment: paymentValue,
        description: data.description,
        responsibilities: responsibilitiesArray,
        benefits: benefitsArray,
        skillsRequired: skillsArray,
        language: languageArray,
        closingDate: format(data.application_deadline, "yyyy-MM-dd"),
        minAgeRequired: data.min_age_required.toString(),
        jobType: data.job_type,
      },
      {
        onSuccess: () => {
          onSuccess();
          onClose();
        },
        onError: (error: unknown) => {
          const err = error as {
            response?: {
              data?: {
                error?: { issues?: { path: string[]; message: string }[] };
              };
            };
          };
          const firstIssue = err.response?.data?.error?.issues?.[0];
          const errorMessage = firstIssue
            ? `${firstIssue.path.join(".")}: ${firstIssue.message}`
            : "Failed to update internship.";

          toast({
            title: "Update Failed",
            description: errorMessage,
            variant: "destructive",
          });
        },
      }
    );
  };

  // --- AI ASSIST (FIXED) ---
  // Using the logic from CreateInternshipDialog that calls useGenerateContent
  const handleAIAssist = async (fieldName: keyof InternshipFormValues) => {
    if (!jobTitle) {
      toast({ title: "Please enter a Job Role first", variant: "destructive" });
      return;
    }

    setAiLoading(fieldName as string);

    let section: AISectionType | null = null;

    // Map form fields to API section types
    switch (fieldName) {
      case "description":
        section = "about";
        break;
      case "responsibilities":
        section = "key_responsibilities";
        break;
      case "benefits":
        section = "what_you_will_get";
        break;
      case "skills_required":
        section = "skills_required";
        break;
    }

    if (!section) {
      setAiLoading(null);
      return;
    }

    try {
      // Call the correct AI endpoint via hook
      const result = await generateContentMutation.mutateAsync({
        title: jobTitle,
        sections: [section],
      });

      let contentToSet = "";

      // Parse the structured response
      if (section === "about" && result.about) {
        contentToSet = result.about;
      } else if (
        section === "key_responsibilities" &&
        result.key_responsibilities
      ) {
        contentToSet = result.key_responsibilities
          .map((item) => `• ${item}`)
          .join("\n");
      } else if (section === "what_you_will_get" && result.what_you_will_get) {
        contentToSet = result.what_you_will_get
          .map((item) => `• ${item}`)
          .join("\n");
      } else if (section === "skills_required" && result.skills_required) {
        contentToSet = result.skills_required.join("\n");
      }

      if (contentToSet) {
        setValue(fieldName, contentToSet, { shouldValidate: true });
        toast({ title: "AI Suggestion Applied" });
      }
    } catch (error) {
      console.error("AI Generation failed:", error);
      toast({
        title: "AI Generation Failed",
        description: "Could not generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAiLoading(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 py-3">
          <DialogTitle className="text-xl font-semibold">
            Edit Job Description
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Update the information about this Job/Internship
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-140px)]">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="px-6 space-y-6 pb-6"
          >
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Job/Intern Role <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="title"
                    placeholder="Enter Job role"
                    className="bg-background rounded-full"
                  />
                )}
              />
              {errors.title && (
                <p className="text-sm text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-sm font-medium">
                Internship Period <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="duration"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="duration"
                    placeholder="Example: 3 months / 1 month"
                    className="bg-background rounded-full"
                  />
                )}
              />
              {errors.duration && (
                <p className="text-sm text-destructive">
                  {errors.duration.message}
                </p>
              )}
            </div>

            {/* Job Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Engagement Type <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="job_type"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-6">
                    {["full_time", "part_time", "both"].map((type) => (
                      <label
                        key={type}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          value={type}
                          checked={field.value === type}
                          onChange={() => field.onChange(type)}
                          className="w-4 h-4 accent-primary"
                        />
                        <span className="text-sm capitalize">
                          {type.replace("_", " ")}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              />
              {errors.job_type && (
                <p className="text-sm text-destructive">
                  {errors.job_type.message}
                </p>
              )}
            </div>

            {/* Paid/Unpaid */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Internship Type <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-6">
                <Controller
                  name="isPaid"
                  control={control}
                  render={({ field }) => (
                    <>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => field.onChange(true)}
                          className={`rounded-full px-6 border border-black ${
                            field.value
                              ? "bg-gray-200 text-black hover:bg-gray-300 hover:!text-black"
                              : "bg-white text-black hover:bg-gray-100 hover:!text-black"
                          }`}
                        >
                          Paid
                        </Button>
                      </div>
                      {field.value && (
                        <Controller
                          name="payment"
                          control={control}
                          render={({ field: pField }) => (
                            <Input
                              {...pField}
                              type="text"
                              placeholder="Amount"
                              className="max-w-[200px]"
                            />
                          )}
                        />
                      )}
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => field.onChange(false)}
                          className={`rounded-full px-6 border border-black ${
                            !field.value
                              ? "bg-gray-200 text-black hover:bg-gray-300 hover:!text-black"
                              : "bg-white text-black hover:bg-gray-100 hover:!text-black"
                          }`}
                        >
                          Unpaid
                        </Button>
                      </div>
                    </>
                  )}
                />
              </div>
              {errors.payment && (
                <p className="text-sm text-destructive">
                  {errors.payment.message}
                </p>
              )}
            </div>

            {/* Min Age */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Minimum Age Required <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="min_age_required"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value?.toString()}
                  >
                    <SelectTrigger className="w-[150px] rounded-full">
                      <SelectValue placeholder="Select age" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(10)].map((_, i) => (
                        <SelectItem key={16 + i} value={String(16 + i)}>
                          {16 + i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.min_age_required && (
                <p className="text-sm text-destructive">
                  {errors.min_age_required.message}
                </p>
              )}
            </div>

            {/* Description Fields with AI */}
            {[
              { name: "description", label: "About Internship" },
              { name: "responsibilities", label: "Key Responsibilities" },
              {
                name: "benefits",
                label: "What you will get (Post Internship)",
              },
              { name: "skills_required", label: "Skills Required" },
            ].map((area) => (
              <div key={area.name} className="space-y-2">
                <Label htmlFor={area.name} className="text-sm font-medium">
                  {area.label} <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name={area.name as keyof InternshipFormValues}
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <Textarea
                        {...field}
                        id={area.name}
                        placeholder="Type here"
                        className="min-h-[120px] bg-background resize-none rounded-2xl"
                        value={field.value as string}
                      />
                      <Button
                        type="button"
                        size="sm"
                        className={`absolute bottom-2 right-2 rounded-full ${
                          isJobRoleFilled
                            ? "bg-teal-600 hover:bg-teal-700"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                        onClick={() =>
                          handleAIAssist(
                            area.name as keyof InternshipFormValues
                          )
                        }
                        disabled={!isJobRoleFilled || aiLoading === area.name}
                      >
                        {aiLoading === area.name ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4 mr-1" />
                        )}
                        {aiLoading === area.name
                          ? "Generating..."
                          : "AI Assistant"}
                      </Button>
                    </div>
                  )}
                />
                {errors[area.name as keyof InternshipFormValues] && (
                  <p className="text-sm text-destructive">
                    {errors[area.name as keyof InternshipFormValues]?.message}
                  </p>
                )}
              </div>
            ))}

            {/* Language Proficiency (Field Array) */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">
                Language Proficiency <span className="text-destructive">*</span>
              </Label>
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-4">
                  <Controller
                    control={control}
                    name={`language_requirements.${index}.language`}
                    render={({ field: f }) => (
                      <Select value={f.value} onValueChange={f.onChange}>
                        <SelectTrigger className="w-[220px] bg-background">
                          <SelectValue placeholder="Select Language" />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGES.map((lang) => (
                            <SelectItem key={lang} value={lang}>
                              {lang}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />

                  {/* Read Checkbox */}
                  <Controller
                    control={control}
                    name={`language_requirements.${index}.read`}
                    render={({ field: f }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`read-${index}`}
                          checked={f.value}
                          onCheckedChange={f.onChange}
                        />
                        <label htmlFor={`read-${index}`} className="text-sm">
                          Read
                        </label>
                      </div>
                    )}
                  />
                  {/* Write Checkbox */}
                  <Controller
                    control={control}
                    name={`language_requirements.${index}.write`}
                    render={({ field: f }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`write-${index}`}
                          checked={f.value}
                          onCheckedChange={f.onChange}
                        />
                        <label htmlFor={`write-${index}`} className="text-sm">
                          Write
                        </label>
                      </div>
                    )}
                  />
                  {/* Speak Checkbox */}
                  <Controller
                    control={control}
                    name={`language_requirements.${index}.speak`}
                    render={({ field: f }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`speak-${index}`}
                          checked={f.value}
                          onCheckedChange={f.onChange}
                        />
                        <label htmlFor={`speak-${index}`} className="text-sm">
                          Speak
                        </label>
                      </div>
                    )}
                  />

                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="link"
                onClick={() =>
                  append({
                    language: "",
                    read: false,
                    write: false,
                    speak: false,
                  })
                }
                className="text-primary pl-0"
              >
                Add another language
              </Button>
              {errors.language_requirements && (
                <p className="text-sm text-destructive">
                  {errors.language_requirements.message}
                </p>
              )}
            </div>

            {/* Date Pickers */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Last date to apply <span className="text-destructive">*</span>
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value);
                      setSelectedMonth("");
                      setSelectedDate("");
                    }}
                    className="w-full px-3 py-2 text-sm text-gray-500 border border-gray-300 rounded-full appearance-none bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-9"
                  >
                    <option value="">Year</option>
                    {years.map((y) => (
                      <option key={y} value={y} className="text-gray-700">
                        {y}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative flex-1">
                  <select
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(e.target.value);
                      setSelectedDate("");
                    }}
                    disabled={!selectedYear}
                    className="w-full px-3 py-2 text-sm text-gray-500 border border-gray-300 rounded-full appearance-none bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-9 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Month</option>
                    {availableMonths.map((m, i) => {
                      const val =
                        selectedYear && parseInt(selectedYear) === currentYear
                          ? currentMonth + i
                          : i + 1;
                      return (
                        <option key={m} value={val}>
                          {m}
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative flex-1">
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    disabled={!selectedMonth || !selectedYear}
                    className="w-full px-3 py-2 text-sm text-gray-500 border border-gray-300 rounded-full appearance-none bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-9 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Date</option>
                    {dates.map((d) => (
                      <option
                        key={d}
                        value={d}
                        disabled={isDateDisabled(
                          d,
                          selectedMonth,
                          selectedYear
                        )}
                        className={
                          isDateDisabled(d, selectedMonth, selectedYear)
                            ? "text-gray-400"
                            : "text-gray-700"
                        }
                      >
                        {d}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              {selectedDate && selectedMonth && selectedYear && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {selectedDate}/{selectedMonth}/{selectedYear}
                </p>
              )}
              {errors.application_deadline && (
                <p className="text-sm text-destructive">
                  {errors.application_deadline.message}
                </p>
              )}
            </div>
          </form>

          <div className="px-6 py-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-3xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={updateInternshipMutation.isPending || !isValid}
              className="rounded-3xl bg-primary hover:bg-primary/90"
            >
              {updateInternshipMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default EditInternshipDialog;
