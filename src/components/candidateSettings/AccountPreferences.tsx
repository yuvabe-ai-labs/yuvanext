import { useState, useCallback } from "react";
import PreferenceItem from "./PreferenceItem";
import DemographicForm from "./DemographicForm";
import VerificationUpload from "./VerificationUpload";
import SkeletonBox from "./SkeletonBox";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle } from "lucide-react"; // Importing icons for the modal
import { useNavigate } from "react-router-dom";
import { useProfileData } from "@/hooks/useProfileData";

export default function AccountPreferences() {
  const [activeSubView, setActiveSubView] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  // New states for Custom Modals
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate(); // Initialize hook
  const { profile } = useProfileData();

  const openProfile = useCallback(() => {
    if (!profile) return;

    const target = profile.role === "student" ? "/profile" : "/unit-profile";
    navigate(target);
  }, [profile, navigate]); // Dependencies are crucial here!

  const openSubViewWithLoad = async (sub) => {
    setLoading(true);
    // Added delay back so skeleton is visible
    await new Promise((r) => setTimeout(r, 400));
    setLoading(false);
    setActiveSubView(sub);
  };

  const executeDeactivate = async () => {
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
      navigate("/");
    } catch (error) {
      console.error("Error deactivating account:", error);
      alert("Failed to deactivate. Please try again.");
      setIsDeactivating(false);
      setShowDeactivateModal(false);
    }
  };

  const executeDelete = async () => {
    try {
      setIsDeleting(true);

      const { error } = await supabase.functions.invoke("delete-user");

      if (error) throw error;

      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to delete account. Please try again.");
      setIsDeleting(false); // Only reset if error
      setShowDeleteModal(false);
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
    <div className="relative">
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

        {/* <PreferenceItem
          title="Verifications"
          onClick={() => openSubViewWithLoad("verification")}
        /> */}
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
          <button
            onClick={() => setShowDeactivateModal(true)} // Open Custom Modal
            disabled={isDeactivating || isDeleting}
            className="w-full text-left text-base text-red-500 border-b border-gray-200 py-5 flex justify-between cursor-pointer hover:bg-gray-50 disabled:opacity-50"
          >
            Deactivate Account
          </button>

          <button
            onClick={() => setShowDeleteModal(true)} // Open Custom Modal
            disabled={isDeleting || isDeactivating}
            className="w-full text-left text-base text-red-500 border-b border-gray-200 py-5 flex justify-between cursor-pointer hover:bg-gray-50 disabled:opacity-50"
          >
            Delete Account
          </button>
        </div>
        {/* <h3 className="text-xl font-medium mb-3 text-gray-800">
          Account Management
        </h3>
        <div className="border rounded-md p-4">
          <button className="text-red-500">Deactivate Account</button>
          <div className="h-px bg-gray-100 my-3" />
          <button className="text-red-500">Delete Account</button>
        </div> */}
      </section>

      {/* --- CUSTOM MODAL: DEACTIVATE --- */}
      {showDeactivateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => !isDeactivating && setShowDeactivateModal(false)} // Close on clicking outside
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden transform transition-all"
            onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside
          >
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Deactivate Account?
                </h3>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Are you sure? You can reactivate your account by logging in
                anytime within the next{" "}
                <span className="font-semibold text-gray-800">6 months</span>.
                After that, it will be permanently deleted.
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowDeactivateModal(false)}
                  disabled={isDeactivating}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDeactivate}
                  disabled={isDeactivating}
                  className="px-4 py-2 text-white bg-yellow-600 hover:bg-yellow-700 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isDeactivating ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Yes, Deactivate"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- CUSTOM MODAL: DELETE --- */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => !isDeleting && setShowDeleteModal(false)} // Close on clicking outside
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Delete Permanently?
                </h3>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                This action{" "}
                <span className="font-bold text-gray-900">
                  cannot be undone
                </span>
                . This will permanently delete your account and remove your data
                from our servers immediately.
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Account"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
