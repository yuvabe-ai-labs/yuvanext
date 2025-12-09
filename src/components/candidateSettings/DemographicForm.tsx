import React, { useState } from "react";
import Tag from "./Tag";
import { ChevronLeft } from "lucide-react";

export default function DemographicForm({ onBack }) {
  const [loading] = useState(false);
  const [gender, setGender] = useState("");
  const [disability, setDisability] = useState("");

  const save = () => {
    console.log({ gender, disability });
    alert("Saved (mock)");
    onBack();
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
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
          </div>

          <div>
            <label className="block font-medium text-gray-900 mb-2 text-[15px]">
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="border border-gray-300 rounded-lg w-full p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="nonbinary">Non-binary</option>
              <option value="prefer_not">Prefer not to say</option>
            </select>
          </div>

          <div className="border-t" />

          {/* Disability */}
          <div>
            <label className="block font-medium text-gray-900 mb-2 text-[15px]">
              Disability
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Do you have a disability that substantially limits a major life
              activity, or a history of a disability?
            </p>
            <select
              value={disability}
              onChange={(e) => setDisability(e.target.value)}
              className="border border-gray-300 rounded-lg w-full p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select</option>
              <option value="no">No</option>
              <option value="yes">Yes</option>
              <option value="prefer_not">Prefer not to say</option>
            </select>
          </div>

          <div className="border-t" />

          {/* Info Box */}
          <div className="bg-gray-50 p-4 rounded-lg text-sm border">
            <p className="font-semibold text-gray-900 mb-1">
              How YuvaNext uses this data
            </p>
            <p className="text-gray-600 leading-relaxed">
              Your demographic data will not be shown on your profile. It will
              be used to provide aggregated workforce insights, personalization,
              and help employers reach a diverse talent pool.
            </p>
            <button
              type="button"
              className="text-blue-600 text-sm font-medium mt-1 underline"
            >
              Learn more
            </button>
          </div>

          {/* Save button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              Agree and save
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
