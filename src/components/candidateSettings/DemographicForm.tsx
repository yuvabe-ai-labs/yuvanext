import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useProfileData } from "@/hooks/useProfileData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DemographicForm({ onBack }) {
  const {
    profile,
    studentProfile,
    loading,
    updateProfile,
    updateStudentProfile,
  } = useProfileData();

  const [initialGender, setInitialGender] = useState(null);
  const [gender, setGender] = useState(profile?.gender || "");
  const [disability, setDisability] = useState(
    studentProfile?.is_differently_abled ? "Yes" : "No"
  );

  // Sync when profile data becomes available
  useEffect(() => {
    if (profile) {
      const value = profile.gender ?? "";
      setGender(value);
      setInitialGender(value);
    }
  }, [profile]);

  useEffect(() => {
    if (initialGender === null) return;
    if (gender !== initialGender) {
      updateProfile({ gender });
    }
  }, [gender, initialGender]);

  useEffect(() => {
    updateStudentProfile({
      is_differently_abled: disability === "Yes",
    });
  }, [disability]);

  return (
    <div>
      {/* Back Button - Using shadcn ghost variant */}
      <button
        onClick={onBack}
        className="text-base text-gray-600 font-medium flex items-center gap-1  hover:text-gray-900 mb-6"
      >
        <ChevronLeft /> Back
      </button>

      {/* Header */}
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
        <div className="space-y-8 mt-6">
          {/* Gender */}
          <div className="space-y-5">
            <label className="text-lg font-medium text-gray-800">Gender</label>
            <p className="text-gray-600 text-base">
              Please select your gender identity
            </p>

            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger className="cursor-pointer w-full rounded-full border-gray-300 p-3 focus:ring-2 focus:ring-blue-500">
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
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
          </div>

          <div className="border-t" />

          {/* Disability */}
          <div className="space-y-5">
            <label className="text-lg font-medium text-gray-800">
              Disability
            </label>
            <p className="text-gray-600 text-base">
              Do you have a disability that substantially limits a major life
              activity, or a history of a disability?
            </p>

            <Select value={disability} onValueChange={setDisability}>
              <SelectTrigger className="w-full rounded-full border-gray-300 p-3 focus:ring-2 focus:ring-blue-500">
                <SelectValue placeholder="Select Option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem className="cursor-pointer" value="No">
                  No
                </SelectItem>
                <SelectItem className="cursor-pointer" value="Yes">
                  Yes
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border-t" />

          {/* Info Box */}
          <div className="space-y-5">
            <p className="font-medium text-gray-800 mb-1">
              How YuvaNext uses this data
            </p>
            <p className="text-gray-600 leading-relaxed">
              Your demographic data will not be shown on your profile. It will
              be used to provide aggregated workforce insights, personalization,
              and help employers reach a diverse talent pool.{" "}
              <span className="text-blue-500 font-semibold mt-1 cursor-pointer">
                Learn more
              </span>
            </p>
          </div>

          {/* Save button */}
          {/* <div className="flex justify-center">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-10 py-2 rounded-full font-medium transition"
            >
              Agree and save
            </button>
          </div> */}
        </div>
      )}
    </div>
  );
}
