import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function ChangePasswordModal({ isOpen, onClose }) {
  const { toast } = useToast();
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match.");
      setLoading(false);
      return;
    }

    if (!user?.email) {
      setError("Unable to fetch user. Please login again.");
      setLoading(false);
      return;
    }

    try {
      // 🔒 Step 1 — Re-authenticate
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInErr) {
        setError("Current password is incorrect.");
        setLoading(false);
        return;
      }

      // 🔐 Step 2 — Update password
      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateErr) {
        setError(updateErr.message);
        setLoading(false);
        return;
      }

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });

      onClose();
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg relative">
        <button className="absolute right-4 top-4" onClick={onClose}>
          <X size={20} className="text-gray-500" />
        </button>

        <h2 className="text-xl font-semibold mb-4">Change Password</h2>

        {error && (
          <p className="text-red-600 text-sm mb-3 bg-red-50 p-2 rounded">
            {error}
          </p>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          {/* Current Password */}
          <div className="relative">
            <label className="text-sm">Current Password</label>
            <input
              type={showCurrent ? "text" : "password"}
              className="w-full border rounded-lg px-3 py-2 mt-1 pr-10"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-9"
            >
              {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* New Password */}
          <div className="relative">
            <label className="text-sm">New Password</label>
            <input
              type={showNew ? "text" : "password"}
              className="w-full border rounded-lg px-3 py-2 mt-1 pr-10"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-9"
            >
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <label className="text-sm">Confirm New Password</label>
            <input
              type={showConfirm ? "text" : "password"}
              className="w-full border rounded-lg px-3 py-2 mt-1 pr-10"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-9"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
