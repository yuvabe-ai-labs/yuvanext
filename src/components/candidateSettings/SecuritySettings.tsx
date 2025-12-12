import React, { useState } from "react";
import ChangePasswordModal from "@/components/settings/ChangePasswordModal";
import UpdateEmailModal from "@/components/settings/UpdateEmailModal";
import UpdateMobileModal from "@/components/settings/UpdateMobileModal";
import PreferenceItem from "./PreferenceItem";

export default function SecuritySettings() {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Sign In & Security</h2>

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />

      <UpdateEmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
      />

      <UpdateMobileModal
        isOpen={showMobileModal}
        onClose={() => setShowMobileModal(false)}
      />

      <div className="space-y-4">
        <PreferenceItem
          title="Email Address"
          onClick={() => setShowEmailModal(true)}
        />

        <PreferenceItem
          title="Change Password"
          onClick={() => setShowPasswordModal(true)}
        />

        <PreferenceItem
          title="Mobile Number"
          onClick={() => setShowMobileModal(true)}
        />
      </div>
    </div>
  );
}
