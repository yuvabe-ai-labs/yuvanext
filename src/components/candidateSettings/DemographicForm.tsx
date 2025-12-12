import { useEffect, useState } from "react";
// import Tag from "./Tag";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { useProfileData } from "@/hooks/useProfileData";

export default function DemographicForm({ onBack }) {
  const [loading] = useState(false);
  const {
    profile,
    studentProfile,
    // loading,
    updateProfile,
    updateStudentProfile,
  } = useProfileData();
  const [initialGender, setInitialGender] = useState(null);
  const [gender, setGender] = useState(profile?.gender || "");
  const [disability, setDisability] = useState(
    studentProfile?.is_differently_abled ? "Yes" : "No"
  );
  const save = () => {
    console.log({ gender, disability });
    alert("Saved (mock)");
    onBack();
  };

  // Sync when profile data becomes available
  useEffect(() => {
    if (profile) {
      const value = profile.gender ?? "";
      setGender(value);
      setInitialGender(value);
    }
  }, [profile]);

  // Update DB ONLY if user changed it
  useEffect(() => {
    if (initialGender === null) return; // wait until initial value is known
    if (gender !== initialGender) {
      updateProfile({ gender });
    }
  }, [gender, initialGender]);

  // Update Supabase when disability changes (your existing logic)
  useEffect(() => {
    updateStudentProfile({
      is_differently_abled: disability === "Yes",
    });
  }, [disability]);

  return (
    <div>
      {/* Back Button */}
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
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 w-2/5 rounded animate-pulse" />
          <div className="h-10 bg-gray-200 w-full rounded animate-pulse" />
          <div className="h-6 bg-gray-200 w-1/3 rounded animate-pulse" />
          <div className="h-10 bg-gray-200 w-full rounded animate-pulse" />
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
          className="space-y-8 mt-6"
        >
          {/* Gender */}
          <div className="space-y-5">
            <label className="text-lg font-medium text-gray-600">Gender</label>
            <p className="text-gray-600 text-base">
              Please select your gender identity
            </p>
            <div className="relative">
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="border border-gray-300 rounded-full w-full p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="prefer_not">Prefer not to say</option>
              </select>
              <ChevronDown className="absolute top-3 right-5 w-4" />
            </div>
          </div>

          <div className="border-t" />

          {/* Disability */}
          <div className="space-y-5">
            <label className="text-lg font-medium text-gray-600">
              Disability
            </label>
            <p className="text-gray-600 text-base">
              Do you have a disability that substantially limits a major life
              activity, or a history of a disability?
            </p>
            <div className="relative">
              <select
                value={disability}
                onChange={(e) => setDisability(e.target.value)}
                className=" border border-gray-300 w-full py-3 px-4 rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
              >
                <option value={disability === "Yes" ? "Yes" : "No"}>
                  {disability === "Yes" ? "Yes" : "No"}
                </option>
                <option value={disability !== "Yes" ? "Yes" : "No"}>
                  {disability !== "Yes" ? "Yes" : "No"}
                </option>
              </select>
              <ChevronDown className="absolute top-3 right-5 w-4" />
            </div>
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
        </form>
      )}
    </div>
  );
}
