import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// Components
import PreferenceItem from "./PreferenceItem";
import DemographicForm from "./DemographicForm";
import VerificationUpload from "./VerificationUpload";
import SkeletonBox from "./SkeletonBox";
import { DeactivateModal, DeleteModal } from "./ActionModals";

// Hooks
import { useUnitProfile } from "@/hooks/useUnitProfile";
import { useDeactivateAccount, useDeleteAccount } from "@/hooks/useSettings";

export default function AccountPreferences() {
  const [activeSubView, setActiveSubView] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const navigate = useNavigate();

  // 1. Data Hooks
  const { data: profile, isLoading: profileLoading } = useUnitProfile();

  // 2. Action Hooks
  const deactivateMutation = useDeactivateAccount();
  const deleteMutation = useDeleteAccount();

  // Every role has its own profile page — a two-way check sent mentors to
  // /unit-profile. Mirrors handleProfileClick in Navbar.
  const openProfile = useCallback(() => {
    if (!profile) return;
    const target =
      profile.role === "unit"
        ? "/unit-profile"
        : profile.role === "mentor"
          ? "/mentor-profile"
          : "/profile";
    navigate(target);
  }, [profile, navigate]);

  const openSubViewWithLoad = async (sub: string) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    setLoading(false);
    setActiveSubView(sub);
  };

  if (loading || profileLoading) {
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

  if (activeSubView === "demographic")
    return <DemographicForm onBack={() => setActiveSubView(null)} />;
  if (activeSubView === "verification")
    return <VerificationUpload onBack={() => setActiveSubView(null)} />;

  // Admins have no profile page in this app — every row here would open a
  // candidate or unit page rendered against an admin record. The demographic
  // row is already candidate-only, so the whole section is hidden for them.
  const isAdmin = profile?.role === "admin";

  return (
    <div className="relative">
      {!isAdmin && (
        <>
          <h2 className="text-xl text-gray-800 font-medium">
            Personal Information
          </h2>
          <div className="rounded-md overflow-hidden">
            <PreferenceItem
              title="Name, Skills and Interests"
              onClick={openProfile}
            />
            {profile?.role === "candidate" && (
              <PreferenceItem
                title="Personal Demographic Information"
                onClick={() => openSubViewWithLoad("demographic")}
              />
            )}
          </div>
        </>
      )}

      <section className="mt-7">
        <h3 className="text-xl font-medium text-gray-800">
          Account Management
        </h3>
        <div className="font-medium">
          <button
            onClick={() => setShowDeactivateModal(true)}
            className="w-full text-left text-base text-red-500 border-b border-gray-200 py-5 flex justify-between cursor-pointer hover:bg-gray-50"
          >
            Deactivate Account
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full text-left text-base text-red-500 border-b border-gray-200 py-5 flex justify-between cursor-pointer hover:bg-gray-50"
          >
            Delete Account
          </button>
        </div>
      </section>

      {/* --- MODALS --- */}
      <DeactivateModal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        onConfirm={() =>
          deactivateMutation.mutate(undefined, {
            onSuccess: () => {
              setShowDeactivateModal(false);
              navigate("/");
            },
          })
        }
        isLoading={deactivateMutation.isPending}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() =>
          deleteMutation.mutate(undefined, {
            onSuccess: () => {
              setShowDeleteModal(false);
              navigate("/");
            },
          })
        }
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
