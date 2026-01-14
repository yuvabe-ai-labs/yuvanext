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
// FIX: Imported useFieldArray
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { X, Sparkles, ChevronDown, Loader2 } from "lucide-react";
import { format } from "date-fns";

// 1. IMPORT HOOKS
import { useCreateInternship } from "@/hooks/useInternships";
import { useGenerateContent } from "@/hooks/useAI";
import { authClient } from "@/lib/auth-client";
import { AISectionType } from "@/types/ai.types";

// 2. IMPORT SCHEMAS & TYPES
import {
  createInternshipSchema,
  type InternshipFormValues,
} from "@/lib/CreateInternshipDialogSchema";

interface CreateInternshipDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
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

const CreateInternshipDialog: React.FC<CreateInternshipDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const { toast } = useToast();

  const createInternshipMutation = useCreateInternship();
  const generateContentMutation = useGenerateContent();

  const [aiLoadingField, setAiLoadingField] = useState<string | null>(null);

  // Removed redundant useState for isPaidState, use watch() instead if needed for UI logic

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<InternshipFormValues>({
    resolver: zodResolver(createInternshipSchema),
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

  // FIX: useFieldArray for dynamic language fields
  const { fields, append, remove } = useFieldArray({
    control,
    name: "language_requirements",
  });

  const jobTitle = watch("title");
  const isJobRoleFilled = jobTitle && jobTitle.trim().length > 0;

  // AI Assist Handler
  const handleAIAssist = async (fieldName: keyof InternshipFormValues) => {
    if (!jobTitle) {
      toast({ title: "Please enter a Job Role first", variant: "destructive" });
      return;
    }

    setAiLoadingField(fieldName as string);

    let section: AISectionType | null = null;
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

    if (!section) return;

    try {
      const result = await generateContentMutation.mutateAsync({
        title: jobTitle,
        sections: [section],
      });

      let contentToSet = "";

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
      toast({ title: "AI Generation Failed", variant: "destructive" });
    } finally {
      setAiLoadingField(null);
    }
  };

  const onSubmit = async (data: InternshipFormValues) => {
    if (!user) return;

    const skillsArray = data.skills_required
      .split("\n")
      .filter((s) => s.trim());
    const responsibilitiesArray = data.responsibilities
      .split("\n")
      .filter((r) => r.trim());
    const benefitsArray = data.benefits.split("\n").filter((b) => b.trim());

    // Simply map from form data
    const languageArray = data.language_requirements.map((l) => l.language);

    const paymentValue = data.isPaid && data.payment ? data.payment : "Unpaid";

    createInternshipMutation.mutate(
      {
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
        status: "active",
      },
      {
        onSuccess: () => {
          onSuccess();
          onClose();
        },
      }
    );
  };

  // Date Picker Logic
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

  const isDateDisabled = (date: string, month: string, year: string) => {
    if (!month || !year) return false;
    const selectedTimestamp = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(date)
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

  useEffect(() => {
    if (selectedDate && selectedMonth && selectedYear) {
      const date = new Date(
        parseInt(selectedYear),
        parseInt(selectedMonth) - 1,
        parseInt(selectedDate)
      );
      if (date.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)) {
        setSelectedDate("");
        return;
      }
      setValue("application_deadline", date, { shouldValidate: true });
    }
  }, [selectedDate, selectedMonth, selectedYear, setValue]);

  useEffect(() => {
    if (selectedDate && selectedMonth && selectedYear) {
      if (isDateDisabled(selectedDate, selectedMonth, selectedYear))
        setSelectedDate("");
    }
  }, [selectedMonth, selectedYear]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 py-3"></DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-140px)]">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="px-6 space-y-6 pb-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-semibold">
                  Create new Job Description
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-1">
                  This information is important for candidates to know better
                  about Job/Internship
                </DialogDescription>
              </div>
            </div>

            {/* Job/Intern Role */}
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

            {/* Internship Period */}
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
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="full_time"
                        checked={field.value === "full_time"}
                        onChange={() => field.onChange("full_time")}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="text-sm">Full Time</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="part_time"
                        checked={field.value === "part_time"}
                        onChange={() => field.onChange("part_time")}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="text-sm">Part Time</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="both"
                        checked={field.value === "both"}
                        onChange={() => field.onChange("both")}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="text-sm">Both</span>
                    </label>
                  </div>
                )}
              />
              {errors.job_type && (
                <p className="text-sm text-destructive">
                  {errors.job_type.message}
                </p>
              )}
            </div>

            {/* Internship Type (Paid/Unpaid) */}
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
                              ? "bg-gray-200 text-black hover:bg-gray-300"
                              : "bg-white text-black hover:bg-gray-100"
                          }`}
                        >
                          Paid
                        </Button>
                      </div>
                      {field.value && (
                        <Controller
                          name="payment"
                          control={control}
                          render={({ field: paymentField }) => (
                            <Input
                              {...paymentField}
                              type="text"
                              placeholder="e.g. 10,000 or To be discussed"
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
                              ? "bg-gray-200 text-black hover:bg-gray-300"
                              : "bg-white text-black hover:bg-gray-100"
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

            {/* Minimum Age */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Minimum Age Required <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="min_age_required"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange}>
                    <SelectTrigger className="w-[150px] rounded-full">
                      <SelectValue placeholder="Select age" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(10)].map((_, i) => {
                        const age = 16 + i;
                        return (
                          <SelectItem key={age} value={String(age)}>
                            {age}
                          </SelectItem>
                        );
                      })}
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

            {/* About Internship */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                About Internship <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <Textarea
                      {...field}
                      id="description"
                      placeholder="Type here"
                      className="min-h-[120px] bg-background resize-none rounded-2xl"
                    />
                    <Button
                      type="button"
                      size="sm"
                      className={`absolute bottom-2 right-2 rounded-full ${
                        isJobRoleFilled
                          ? "bg-teal-600 hover:bg-teal-700"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                      onClick={() => handleAIAssist("description")}
                      disabled={
                        !isJobRoleFilled || aiLoadingField === "description"
                      }
                    >
                      {aiLoadingField === "description" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 mr-1" />
                      )}
                      {aiLoadingField === "description"
                        ? "Generating..."
                        : "AI Assistant"}
                    </Button>
                  </div>
                )}
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Key Responsibilities */}
            <div className="space-y-2">
              <Label htmlFor="responsibilities" className="text-sm font-medium">
                Key Responsibilities <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="responsibilities"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <Textarea
                      {...field}
                      id="responsibilities"
                      placeholder="Type here"
                      className="min-h-[120px] bg-background resize-none rounded-2xl"
                    />
                    <Button
                      type="button"
                      size="sm"
                      className={`absolute bottom-2 right-2 rounded-full ${
                        isJobRoleFilled
                          ? "bg-teal-600 hover:bg-teal-700"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                      onClick={() => handleAIAssist("responsibilities")}
                      disabled={
                        !isJobRoleFilled ||
                        aiLoadingField === "responsibilities"
                      }
                    >
                      {aiLoadingField === "responsibilities" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 mr-1" />
                      )}
                      {aiLoadingField === "responsibilities"
                        ? "Generating..."
                        : "AI Assistant"}
                    </Button>
                  </div>
                )}
              />
              {errors.responsibilities && (
                <p className="text-sm text-destructive">
                  {errors.responsibilities.message}
                </p>
              )}
            </div>

            {/* Post Internship Benefits */}
            <div className="space-y-2">
              <Label htmlFor="benefits" className="text-sm font-medium">
                What you will get (Post Internship){" "}
                <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="benefits"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <Textarea
                      {...field}
                      id="benefits"
                      placeholder="Type here"
                      className="min-h-[120px] bg-background resize-none rounded-2xl"
                    />
                    <Button
                      type="button"
                      size="sm"
                      className={`absolute bottom-2 right-2 rounded-full ${
                        isJobRoleFilled
                          ? "bg-teal-600 hover:bg-teal-700"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                      onClick={() => handleAIAssist("benefits")}
                      disabled={
                        !isJobRoleFilled || aiLoadingField === "benefits"
                      }
                    >
                      {aiLoadingField === "benefits" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 mr-1" />
                      )}
                      {aiLoadingField === "benefits"
                        ? "Generating..."
                        : "AI Assistant"}
                    </Button>
                  </div>
                )}
              />
              {errors.benefits && (
                <p className="text-sm text-destructive">
                  {errors.benefits.message}
                </p>
              )}
            </div>

            {/* Skills Required */}
            <div className="space-y-2">
              <Label htmlFor="skills_required" className="text-sm font-medium">
                Skills Required <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="skills_required"
                control={control}
                render={({ field }) => (
                  <div className="relative">
                    <Textarea
                      {...field}
                      id="skills_required"
                      placeholder="Type here"
                      className="min-h-[120px] bg-background resize-none rounded-2xl"
                    />
                    <Button
                      type="button"
                      size="sm"
                      className={`absolute bottom-2 right-2 rounded-full ${
                        isJobRoleFilled
                          ? "bg-teal-600 hover:bg-teal-700"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                      onClick={() => handleAIAssist("skills_required")}
                      disabled={
                        !isJobRoleFilled || aiLoadingField === "skills_required"
                      }
                    >
                      {aiLoadingField === "skills_required" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 mr-1" />
                      )}
                      {aiLoadingField === "skills_required"
                        ? "Generating..."
                        : "AI Assistant"}
                    </Button>
                  </div>
                )}
              />
              {errors.skills_required && (
                <p className="text-sm text-destructive">
                  {errors.skills_required.message}
                </p>
              )}
            </div>

            {/* Language Proficiency - REFACTORED */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">
                Language Proficiency <span className="text-destructive">*</span>
              </Label>

              {/* FIX: Map over 'fields' from useFieldArray */}
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-4">
                  {/* Language Selection */}
                  <Controller
                    control={control}
                    name={`language_requirements.${index}.language`}
                    render={({ field: selectField }) => (
                      <Select
                        value={selectField.value}
                        onValueChange={selectField.onChange}
                      >
                        <SelectTrigger className="w-[220px] bg-background">
                          <SelectValue placeholder="Select Language" />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGES.map((language) => (
                            <SelectItem key={language} value={language}>
                              {language}
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
                    render={({ field: cbField }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={cbField.value}
                          onCheckedChange={cbField.onChange}
                        />
                        <label className="text-sm font-normal">Read</label>
                      </div>
                    )}
                  />

                  {/* Write Checkbox */}
                  <Controller
                    control={control}
                    name={`language_requirements.${index}.write`}
                    render={({ field: cbField }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={cbField.value}
                          onCheckedChange={cbField.onChange}
                        />
                        <label className="text-sm font-normal">Write</label>
                      </div>
                    )}
                  />

                  {/* Speak Checkbox */}
                  <Controller
                    control={control}
                    name={`language_requirements.${index}.speak`}
                    render={({ field: cbField }) => (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={cbField.value}
                          onCheckedChange={cbField.onChange}
                        />
                        <label className="text-sm font-normal">Speak</label>
                      </div>
                    )}
                  />

                  {/* Remove Button (Only if more than 1) */}
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)} // Use remove from useFieldArray
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="link"
                // Use append from useFieldArray
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

            {/* Last date to apply */}
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
                      <option key={y} value={y}>
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
                    {availableMonths.map((m, i) => (
                      <option
                        key={m}
                        value={
                          selectedYear && parseInt(selectedYear) === currentYear
                            ? currentMonth + i
                            : i + 1
                        }
                      >
                        {m}
                      </option>
                    ))}
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
                          d.toString(),
                          selectedMonth,
                          selectedYear
                        )}
                        className={
                          isDateDisabled(
                            d.toString(),
                            selectedMonth,
                            selectedYear
                          )
                            ? "text-gray-400"
                            : ""
                        }
                      >
                        {d}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              {selectedDate && (
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

          <div className="px-6 py-4 flex justify-end">
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={createInternshipMutation.isPending || !isValid}
              className="rounded-3xl bg-primary hover:bg-primary/90"
            >
              {createInternshipMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CreateInternshipDialog;
