import React, { useState, useCallback } from "react";
import PreferenceItem from "./PreferenceItem";
import DemographicForm from "./DemographicForm";
import VerificationUpload from "./VerificationUpload";
import SkeletonBox from "./SkeletonBox";

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
      <h2 className="text-xl font-semibold mb-4">Personal Information</h2>

      <div className="space-y-2 border rounded-md overflow-hidden">
        <PreferenceItem
          title="Name, skills, and interests"
          description="Update your visible profile information"
          onClick={openProfile}
        />

        <PreferenceItem
          title="Personal Demographic information"
          description="Provide voluntary demographic details to help us report aggregated insights"
          onClick={() => openSubViewWithLoad("demographic")}
        />

        <PreferenceItem
          title="Verifications"
          description="Upload government ID to verify your identity"
          onClick={() => openSubViewWithLoad("verification")}
        />
      </div>

      <section className="mt-10">
        <h3 className="text-lg font-semibold mb-3">General Preferences</h3>
        <div className="space-y-2 border rounded-md p-3">
          <div className="flex flex-wrap items-center">
            <div className="flex-1">
              <div className="text-sm text-gray-600">Language</div>
              <div className="mt-2">
                <select className="border rounded px-3 py-2 w-full md:w-60">
                  <option>English</option>
                  <option>Hindi</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h3 className="text-lg font-semibold mb-3">Account Management</h3>
        <div className="border rounded-md p-4">
          <button className="text-red-500">Deactivate Account</button>
          <div className="h-px bg-gray-100 my-3" />
          <button className="text-red-500">Delete Account</button>
        </div>
      </section>
    </div>
  );
}
