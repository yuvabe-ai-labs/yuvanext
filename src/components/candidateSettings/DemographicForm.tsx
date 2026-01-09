import { useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { demographicSchema } from "@/lib/demographicFormSchema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";

// NEW IMPORTS: Use our standardized hooks
import { useUnitProfile, useUpdateUnitProfile } from "@/hooks/useUnitProfile";

export default function DemographicForm({ onBack }: { onBack: () => void }) {
  // 1. Fetch Profile Data
  const { data: profile, isLoading: loading } = useUnitProfile();
  console.log("profile");
  console.log(profile);

  // 2. Mutation Hook for updates
  const updateProfileMutation = useUpdateUnitProfile();

  const form = useForm({
    resolver: zodResolver(demographicSchema),
    defaultValues: {
      gender: "",
      disability: "No",
    },
  });

  // 3. Populate Form
  useEffect(() => {
    if (profile) {
      // Assuming 'gender' and 'isDifferentlyAbled' (or similar) are in the unified profile object now.
      // Adjust property names based on your exact API response if different.
      form.setValue("gender", profile.gender || "");
      // If disability status is stored in profile (e.g. isDifferentlyAbled boolean)
      // We map boolean to "Yes"/"No" string for the select input
      form.setValue("disability", profile.isDifferentlyAbled ? "Yes" : "No");
    }
  }, [profile, form]);

  const onSubmit = async (data: any) => {
    try {
      // 4. Update Profile via Mutation
      // We map the form "Yes"/"No" back to boolean for the API
      await updateProfileMutation.mutateAsync({
        gender: data.gender,
        isDifferentlyAbled: data.disability === "Yes", // Map string to boolean
      });

      // Optional: Add success toast here if not handled by hook, or just rely on hook
    } catch (error) {
      console.error("Failed to save demographic data:", error);
    }
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="text-base text-gray-600 font-medium flex items-center gap-1 hover:text-gray-900 mb-6"
      >
        <ChevronLeft /> Back
      </button>

      <div className="space-y-5">
        <h2 className="text-xl font-medium text-gray-800">
          Demographic Information
        </h2>
        <p className="text-gray-600 text-base">
          Here’s the information you’ve provided about yourself. This will not
          be displayed on your profile.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4 mt-6">
          <div className="h-6 bg-gray-200 w-2/5 rounded animate-pulse" />
          <div className="h-10 bg-gray-200 w-full rounded animate-pulse" />
        </div>
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 mt-6"
          >
            {/* Gender Field */}
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem className="space-y-5">
                  <label className="text-lg font-medium text-gray-800">
                    Gender
                  </label>
                  <p className="text-gray-600 text-base">
                    Please select your gender identity
                  </p>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="cursor-pointer w-full rounded-full border-gray-300 p-3 h-12 focus:ring-2 focus:ring-blue-500">
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem className="cursor-pointer" value="male">
                        Male
                      </SelectItem>
                      <SelectItem className="cursor-pointer" value="female">
                        Female
                      </SelectItem>
                      <SelectItem className="cursor-pointer" value="prefer_not">
                        Prefer not to say
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <div className="border-t" />

            {/* Disability Field */}
            <FormField
              control={form.control}
              name="disability"
              render={({ field }) => (
                <FormItem className="space-y-5">
                  <label className="text-lg font-medium text-gray-800">
                    Disability
                  </label>
                  <p className="text-gray-600 text-base">
                    Do you have a disability that substantially limits a major
                    life activity, or a history of a disability?
                  </p>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="cursor-pointer w-full rounded-full border-gray-300 p-3 h-12 focus:ring-2 focus:ring-blue-500">
                        <SelectValue placeholder="Select Option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem className="cursor-pointer" value="No">
                        No
                      </SelectItem>
                      <SelectItem className="cursor-pointer" value="Yes">
                        Yes
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <div className="border-t" />

            <div className="space-y-5">
              <p className="font-medium text-gray-800 mb-1">
                How YuvaNext uses this data
              </p>
              <p className="text-gray-600 leading-relaxed">
                Your demographic data will not be shown on your profile. It will
                be used to provide aggregated workforce insights,
                personalization, and help employers reach a diverse talent pool.{" "}
                <span className="text-blue-500 font-semibold mt-1 cursor-pointer">
                  Learn more
                </span>
              </p>
            </div>

            <div className="flex justify-center pt-4">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-10 py-2 rounded-full font-medium transition disabled:opacity-50"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending
                  ? "Saving..."
                  : "Agree and save"}
              </button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
