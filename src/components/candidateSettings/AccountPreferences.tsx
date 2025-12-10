import React, { useState, useCallback } from "react";
import PreferenceItem from "./PreferenceItem";
import DemographicForm from "./DemographicForm";
import VerificationUpload from "./VerificationUpload";
import SkeletonBox from "./SkeletonBox";
import { ChevronRight } from "lucide-react";

/**
 * AccountPreferences implements an internal "activeSubView" state:
 * - null => render the list of items
 * - 'demographic' => show DemographicForm (with back)
 * - 'verification' => show VerificationUpload (with back)
 *
 * It also demonstrates skeleton loading when fetching the list (mock).
 */

export default function AccountPreferences() {
  const [activeSubView, setActiveSubView] = useState(null);
  const [loading, setLoading] = useState(false);

  const openProfile = useCallback(() => {
    // In your app you may want to use router navigation.
    // For now we simulate opening profile in same app:
    window.location.href = "/profile"; // or use your app's navigation
  }, []);

  // mock load function for dynamic content because sometimes you want to fetch before switching
  const openSubViewWithLoad = async (sub) => {
    setLoading(true);
    // simulate network delay
    await new Promise((r) => setTimeout(r, 400));
    setLoading(false);
    setActiveSubView(sub);
    // optionally fetch sub view data here
  };

  // Render logic
  if (loading) {
    return (
      <div>
        <div className="mb-4">
          <SkeletonBox className="h-8 w-1/3" />
        </div>
        <div className="space-y-3">
          <SkeletonBox className="h-16" />
          <SkeletonBox className="h-16" />
          <SkeletonBox className="h-16" />
        </div>
      </div>
    );
  }

  if (activeSubView === "demographic") {
    return <DemographicForm onBack={() => setActiveSubView(null)} />;
  }

  if (activeSubView === "verification") {
    return <VerificationUpload onBack={() => setActiveSubView(null)} />;
  }

  return (
    <div>
      <h2 className="text-xl text-gray-800 font-medium">
        Personal Information
      </h2>

      <div className="rounded-md overflow-hidden">
        <PreferenceItem
          title="Name, Skills and Interests"
          onClick={openProfile}
        />

        <PreferenceItem
          title="Personal Demographic Information"
          onClick={() => openSubViewWithLoad("demographic")}
        />

        <PreferenceItem
          title="Verifications"
          onClick={() => openSubViewWithLoad("verification")}
        />
      </div>

      {/* <section className="mt-7">
        <h3 className="text-xl font-medium text-gray-800">
          General Preferences
        </h3>
        <div className="font-medium">
          <div className="text-base text-gray-600 border-b border-gray-200 py-5 flex justify-between">
            Language <ChevronRight aria-hidden className="text-gray-400" />
          </div>
          <div className="text-base text-gray-600 border-b border-gray-200 py-5 flex justify-between">
            Content Language
            <ChevronRight aria-hidden className="text-gray-400" />
             <select className="border rounded px-3 py-2 w-full md:w-60">
              <option>English</option>
              <option>Hindi</option>
            </select> 
          </div>
        </div>
      </section> */}

      <section className="mt-7">
        <h3 className="text-xl font-medium text-gray-800">
          Account Management
        </h3>
        <div className="font-medium">
          <div className="text-base text-red-500 border-b border-gray-200 py-5 flex justify-between">
            Deactivate Account
          </div>
          <div className="text-base text-red-500 border-b border-gray-200 py-5 flex justify-between">
            Delete Account
          </div>
        </div>
        {/*         
        <h3 className="text-xl font-medium mb-3 text-gray-800">
          Account Management
        </h3>
        <div className="border rounded-md p-4">
          <button className="text-red-500">Deactivate Account</button>
          <div className="h-px bg-gray-100 my-3" />
          <button className="text-red-500">Delete Account</button>
        </div> */}
      </section>
    </div>
  );
}
