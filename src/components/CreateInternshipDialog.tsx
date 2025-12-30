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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { X, Upload, Sparkles } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";

interface CreateInternshipDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Language proficiency type
interface LanguageProficiency {
  language: string;
  read: boolean;
  write: boolean;
  speak: boolean;
}

// Validation schema
const languageSchema = z
  .object({
    language: z.string().min(1, "Language is required"),
    read: z.boolean(),
    write: z.boolean(),
    speak: z.boolean(),
  })
  .refine((data) => data.read || data.write || data.speak, {
    message: "Select at least one proficiency (Read, Write, or Speak)",
    path: ["read"],
  });

const formSchema = z.object({
  title: z.string().min(1, "Job/Intern Role is required"),
  duration: z.string().min(1, "Internship Period is required"),
  isPaid: z.boolean(),
  payment: z.string().optional(), // Changed from optional().nullable() to just optional()
  description: z
    .string()
    .min(10, "About Internship must be at least 10 characters"),
  responsibilities: z.string().min(10, "Key Responsibilities is required"),
  benefits: z.string().min(10, "Post Internship benefits is required"),
  skills_required: z.string().min(1, "Skills Required is required"),
  language_requirements: z
    .array(languageSchema)
    .min(1, "At least one language is required"),
  min_age_required: z.coerce
    .number({
      required_error: "Minimum age is required",
      invalid_type_error: "Minimum age must be a number",
    })
    .min(1, "Age is required"),
  job_type: z.enum(["full_time", "part_time", "both"]),
  application_deadline: z.date({
    required_error: "Application deadline is required",
  }),
});

type FormData = z.infer<typeof formSchema>;

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
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [languages, setLanguages] = useState<LanguageProficiency[]>([
    { language: "", read: false, write: false, speak: false },
  ]);

  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [isPaidState, setIsPaidState] = React.useState<boolean | null>(null); // âœ… renamed

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
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
      min_age_required: undefined, // Changed from "" to undefined
      job_type: "full_time",
    },
  });
  const jobTitle = watch("title");
  const isJobRoleFilled = jobTitle && jobTitle.trim().length > 0;

  const isPaid = watch("isPaid");

  const handleAddLanguage = () => {
    const newLanguages = [
      ...languages,
      { language: "", read: false, write: false, speak: false },
    ];
    setLanguages(newLanguages);
    setValue("language_requirements", newLanguages, { shouldValidate: true });
  };

  const handleLanguageChange = (
    index: number,
    field: keyof LanguageProficiency,
    value: any
  ) => {
    const newLanguages = [...languages];
    newLanguages[index] = { ...newLanguages[index], [field]: value };
    setLanguages(newLanguages);
    setValue("language_requirements", newLanguages, { shouldValidate: true });
  };

  const handleRemoveLanguage = (index: number) => {
    if (languages.length > 1) {
      const newLanguages = languages.filter((_, i) => i !== index);
      setLanguages(newLanguages);
      setValue("language_requirements", newLanguages, { shouldValidate: true });
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create an internship",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Get profile ID
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profile) {
        throw new Error("Profile not found");
      }

      // Parse skills and responsibilities into arrays
      const skillsArray = data.skills_required
        .split("\n")
        .filter((s) => s.trim());
      const responsibilitiesArray = data.responsibilities
        .split("\n")
        .filter((r) => r.trim());
      const benefitsArray = data.benefits.split("\n").filter((b) => b.trim());

      // Get unit name and address from units table
      const { data: units, error: unitsError } = await supabase
        .from("units")
        .select("unit_name, address")
        .eq("profile_id", profile.id)
        .maybeSingle();

      if (unitsError) {
        console.error("Error fetching unit:", unitsError);
      }

      // Create internship
      console.log("Creating internship with profile ID:", profile.id);
      const { error } = await supabase.from("internships").insert({
        title: data.title,
        duration: data.duration,
        is_paid: data.isPaid,
        payment: data.isPaid && data.payment ? data.payment : null,
        description: data.description,
        responsibilities: responsibilitiesArray,
        benefits: benefitsArray,
        skills_required: skillsArray,
        language_requirements: data.language_requirements,
        application_deadline: format(data.application_deadline, "yyyy-MM-dd"),
        created_by: profile.id,
        status: "active",
        company_name: units?.unit_name || "Unit",
        location: units?.address || null, // Add location from unit address
        min_age_required: data.min_age_required,
        job_type: data.job_type,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Internship posted successfully!",
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating internship:", error);
      toast({
        title: "Error",
        description: "Failed to create internship. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // AI Assistant function
  const handleAIAssist = async (fieldName: keyof FormData) => {
    console.log("AI Assist triggered for:", fieldName);
    setAiLoading(fieldName as string);

    try {
      const currentValue = watch(fieldName) as string;
      const jobTitle = watch("title") || "this position";

      let prompt = "";

      switch (fieldName) {
        case "description":
          prompt = `Write a single, concise, professional paragraph describing a ${jobTitle} internship.
Avoid introductions like "Here's a draft" or "About the internship".
Focus only on what the internship is about and what the intern will be doing, in 5-7 lines.
Return only the paragraph text, no bullet points or titles.${
            currentValue
              ? ` Current description: "${currentValue}". Please rewrite it as one clear paragraph.`
              : ""
          }`;
          break;

        case "responsibilities":
          prompt = `Write 5-7 key responsibilities for a ${jobTitle} internship.
Each responsibility must be on a new line, without numbering or bullet characters.
Avoid any introduction, summary, or phrases like "Here are the responsibilities".
Return only the clean list of responsibilities.${
            currentValue
              ? ` Current responsibilities: "${currentValue}". Please rewrite and clean them.`
              : ""
          }`;
          break;

        case "benefits":
          prompt = `List 4-6 post-internship benefits that a candidate would receive after completing a ${jobTitle} internship.
Return only the clean list, one benefit per line, no extra text or introduction.`;
          break;

        case "skills_required":
          prompt = `List 5-8 essential skills required for a ${jobTitle} internship.
Return only the clean list, one skill per line, no extra text or introduction`;
          break;

        default:
          prompt = `Help improve the following text for a ${jobTitle} internship: ${currentValue}`;
      }

      const updatedHistory = [
        ...conversationHistory,
        { role: "user", content: prompt },
      ];
      setConversationHistory(updatedHistory);

      const { data: aiResponse, error } = await supabase.functions.invoke(
        "gemini-chat",
        {
          body: {
            message: prompt,
            conversationHistory: updatedHistory,
            userRole: "jd_generation",
          },
        }
      );

      if (error) throw error;

      if (aiResponse?.response) {
        let cleanResponse = aiResponse.response
          // Remove markdown and filler phrases
          .replace(/\*\*/g, "")
          .replace(/\*/g, "")
          .replace(/^#+\s/gm, "")
          .replace(/^(here('|â€™)s|sure|of course|okay|let'?s).*\n/i, "")
          .replace(/^about .*internship.*\n?/i, "")
          .trim();

        // For description â€” keep only first paragraph
        if (fieldName === "description") {
          cleanResponse = cleanResponse.split(/\n\s*\n/)[0].trim();
        }

        // For responsibilities/benefits â€” keep only clean lines
        if (["responsibilities", "benefits"].includes(fieldName)) {
          cleanResponse = cleanResponse
            .split(/\n+/)
            .map((line) => line.replace(/^[-â€¢\d.]\s*/, "").trim())
            .filter((line) => line.length > 0)
            .join("\n");
        }

        setValue(fieldName, cleanResponse, { shouldValidate: true });

        setConversationHistory((prevHistory) => [
          ...prevHistory,
          { role: "ai", content: cleanResponse },
        ]);

        toast({
          title: "AI Suggestion Applied",
          description: "The content has been generated successfully!",
        });
      } else {
        console.error("AI response in unexpected format:", aiResponse);
        toast({
          title: "AI Assist Failed",
          description:
            "Received unexpected response from AI. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("AI Assist error:", error);
      toast({
        title: "AI Assist Failed",
        description: "Unable to generate AI suggestion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAiLoading(null);
    }
  };

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // 1-12
  const currentDay = currentDate.getDate();

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

  // Function to check if a date is disabled
  const isDateDisabled = (date, month, year) => {
    if (!month || !year) return false;

    const selectedTimestamp = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(date)
    ).setHours(0, 0, 0, 0);

    const todayTimestamp = new Date().setHours(0, 0, 0, 0);

    return selectedTimestamp < todayTimestamp;
  };

  // Get available dates based on selected month and year
  const getAvailableDates = () => {
    if (!selectedMonth || !selectedYear) {
      return Array.from({ length: 31 }, (_, i) => i + 1);
    }

    const year = parseInt(selectedYear);
    const month = parseInt(selectedMonth);
    const daysInMonth = new Date(year, month, 0).getDate();

    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  // Get available months based on selected year
  const getAvailableMonths = () => {
    if (!selectedYear) return months;

    const year = parseInt(selectedYear);
    if (year > currentYear) return months;

    // Current year - only show current month onwards
    return months.slice(currentMonth - 1);
  };

  const dates = getAvailableDates();
  const availableMonths = getAvailableMonths();

  // Sync dropdown values with react-hook-form
  useEffect(() => {
    if (selectedDate && selectedMonth && selectedYear) {
      const date = new Date(
        parseInt(selectedYear),
        parseInt(selectedMonth) - 1,
        parseInt(selectedDate)
      );

      // Check if selected date is in the past
      if (date.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)) {
        // Clear the date selection if it's in the past
        setSelectedDate("");
        return;
      }

      setValue("application_deadline", date, { shouldValidate: true });
    }
  }, [selectedDate, selectedMonth, selectedYear, setValue]);

  // Reset date when month or year changes if it becomes invalid
  useEffect(() => {
    if (selectedDate && selectedMonth && selectedYear) {
      if (isDateDisabled(selectedDate, selectedMonth, selectedYear)) {
        setSelectedDate("");
      }
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
            {/* File Upload Section */}
            {/* <div className="border-2 border-dashed border-primary/30 rounded-2xl p-8 bg-primary/5">
              <div className="flex flex-col items-center justify-center text-center space-y-3">
                <Upload className="w-12 h-12 text-primary" />
                <div>
                  <p className="font-semibold text-lg">
                    Upload Job Description
                  </p>
                  <p className="text-sm text-muted-foreground">
                    File should be PDF, Word, Google Docs
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Drag and Drop your files here
                </p>
              </div>
            </div> */}

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

            {/* Internship Type */}
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
                      {/* Paid Button */}
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            field.onChange(true);
                            setIsPaidState(true);
                          }}
                          className={`rounded-full px-6 border border-black ${
                            field.value
                              ? "bg-gray-200 text-black hover:bg-gray-300 hover:!text-black"
                              : "bg-white text-black hover:bg-gray-100 hover:!text-black"
                          }`}
                        >
                          Paid
                        </Button>
                      </div>

                      {/* Show amount input when Paid is selected */}
                      {field.value && (
                        <Controller
                          name="payment"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              type="text"
                              placeholder="e.g. 10000 or To be discussed"
                              className="max-w-[200px]"
                            />
                          )}
                        />
                      )}

                      {/* Unpaid Button */}
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            field.onChange(false);
                            setIsPaidState(false);
                          }}
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

            {/* Minimum Age Required */}
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
                      disabled={!isJobRoleFilled || aiLoading === "description"}
                    >
                      <Sparkles className="w-4 h-4 mr-1" />
                      {aiLoading === "description"
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
                        !isJobRoleFilled || aiLoading === "responsibilities"
                      }
                    >
                      <Sparkles className="w-4 h-4 mr-1" />
                      {aiLoading === "responsibilities"
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
                      disabled={!isJobRoleFilled || aiLoading === "benefits"}
                    >
                      <Sparkles className="w-4 h-4 mr-1" />
                      {aiLoading === "benefits"
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
                        !isJobRoleFilled || aiLoading === "skills_required"
                      }
                    >
                      <Sparkles className="w-4 h-4 mr-1" />
                      {aiLoading === "skills_required"
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

            {/* Language Proficiency */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">
                Language Proficiency <span className="text-destructive">*</span>
              </Label>
              {languages.map((lang, index) => (
                <div key={index} className="flex items-center gap-4">
                  <Select
                    value={lang.language}
                    onValueChange={(value) =>
                      handleLanguageChange(index, "language", value)
                    }
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

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`read-${index}`}
                      checked={lang.read}
                      onCheckedChange={(checked) =>
                        handleLanguageChange(index, "read", checked === true)
                      }
                    />
                    <label
                      htmlFor={`read-${index}`}
                      className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Read
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`write-${index}`}
                      checked={lang.write}
                      onCheckedChange={(checked) =>
                        handleLanguageChange(index, "write", checked === true)
                      }
                    />
                    <label
                      htmlFor={`write-${index}`}
                      className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Write
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`speak-${index}`}
                      checked={lang.speak}
                      onCheckedChange={(checked) =>
                        handleLanguageChange(index, "speak", checked === true)
                      }
                    />
                    <label
                      htmlFor={`speak-${index}`}
                      className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Speak
                    </label>
                  </div>

                  {languages.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveLanguage(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="link"
                onClick={handleAddLanguage}
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
                {/* Year Dropdown - Select year first for better UX */}
                <div className="relative flex-1">
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value);
                      // Reset month and date when year changes
                      setSelectedMonth("");
                      setSelectedDate("");
                    }}
                    className="w-full px-3 py-2 text-sm text-gray-500 border border-gray-300 rounded-full appearance-none bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-9"
                  >
                    <option value="">Year</option>
                    {years.map((year) => (
                      <option key={year} value={year} className="text-gray-700">
                        {year}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Month Dropdown */}
                <div className="relative flex-1">
                  <select
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(e.target.value);
                      // Reset date when month changes
                      setSelectedDate("");
                    }}
                    disabled={!selectedYear}
                    className="w-full px-3 py-2 text-sm text-gray-500 border border-gray-300 rounded-full appearance-none bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-9 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Month</option>
                    {availableMonths.map((month, index) => {
                      const monthValue =
                        selectedYear && parseInt(selectedYear) === currentYear
                          ? currentMonth + index
                          : index + 1;
                      return (
                        <option
                          key={month}
                          value={monthValue}
                          className="text-gray-700"
                        >
                          {month}
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Date Dropdown */}
                <div className="relative flex-1">
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    disabled={!selectedMonth || !selectedYear}
                    className="w-full px-3 py-2 text-sm text-gray-500 border border-gray-300 rounded-full appearance-none bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-9 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Date</option>
                    {dates.map((date) => {
                      const disabled = isDateDisabled(
                        date,
                        selectedMonth,
                        selectedYear
                      );
                      return (
                        <option
                          key={date}
                          value={date}
                          disabled={disabled}
                          className={
                            disabled ? "text-gray-400" : "text-gray-700"
                          }
                        >
                          {date}
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Display selected date */}
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

          <div className="px-6 py-4 flex justify-end">
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting || !isValid}
              className="rounded-3xl bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CreateInternshipDialog;
