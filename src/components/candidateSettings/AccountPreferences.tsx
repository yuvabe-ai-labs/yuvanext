import { useState, useCallback } from "react";
import PreferenceItem from "./PreferenceItem";
import DemographicForm from "./DemographicForm";
import VerificationUpload from "./VerificationUpload";
import SkeletonBox from "./SkeletonBox";
import { supabase } from "@/integrations/supabase/client";

export default function AccountPreferences() {
  const [activeSubView, setActiveSubView] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const openProfile = useCallback(() => {
    window.location.href = "/profile"; // or use your app's navigation
  }, []);

  const openSubViewWithLoad = async (sub) => {
    setLoading(true);
    // Add a small delay so the transition feels smooth (or fetch data here)
    await new Promise((r) => setTimeout(r, 400));
    setLoading(false);
    setActiveSubView(sub);
  };
  const handleDeactivateAccount = async () => {
    const confirmed = window.confirm(
      "Deactivate your account? You can reactivate it by logging in anytime within the next 6 months. After that, it will be permanently deleted."
    );

    if (!confirmed) return;

    try {
      setIsDeactivating(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error("No active session found");
      }

      const { error } = await supabase
        .from("profiles")
        .update({ deactivated_at: new Date().toISOString() })
        .eq("user_id", session.user.id);

      if (error) throw error;

      await supabase.auth.signOut();

      window.location.href = "/";
    } catch (error) {
      console.error("Error deactivating account:", error);
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);

      const { error } = await supabase.functions.invoke("delete-user");

      if (error) throw error;

      await supabase.auth.signOut();

      window.location.href = "/";
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
    }
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
          {/* <div className="text-base text-red-500 border-b border-gray-200 py-5 flex justify-between">
            Deactivate Account
          </div> */}
          <button
            onClick={handleDeactivateAccount}
            disabled={isDeactivating || isDeleting}
            className="w-full text-left text-base text-red-500 border-b border-gray-200 py-5 flex justify-between cursor-pointer hover:bg-gray-50 disabled:opacity-50"
          >
            {isDeactivating ? "Deactivating..." : "Deactivate Account"}
          </button>
          <button
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="w-full text-left text-base text-red-500 border-b border-gray-200 py-5 flex justify-between cursor-pointer hover:bg-gray-50 disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete Account"}
          </button>
          {/*
          <div className="text-base text-red-500 border-b border-gray-200 py-5 flex justify-between cursor-pointer">
            Delete Account
          </div> */}
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
