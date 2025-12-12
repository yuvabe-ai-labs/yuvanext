import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function UpdateEmailModal({ isOpen, onClose }) {
  const { toast } = useToast();
  const { user } = useAuth();

  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load user email
  useEffect(() => {
    if (isOpen && user?.email) {
      setCurrentEmail(user.email);
      setNewEmail(user.email);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!user?.email) {
      setError("Unable to get user. Please login again.");
      setLoading(false);
      return;
    }

    try {
      // Step 1: Re-authenticate
      const { error: loginErr } = await supabase.auth.signInWithPassword({
        email: currentEmail,
        password,
      });

      if (loginErr) {
        setError("Incorrect password.");
        setLoading(false);
        return;
      }

      // Step 2: Update email → sends verification link
      const { error: updateErr } = await supabase.auth.updateUser(
        { email: newEmail },
        {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      );

      if (updateErr) {
        setError(updateErr.message);
        setLoading(false);
        return;
      }

      toast({
        title: "Verification email sent",
        description:
          "Please check your old and new inbox to confirm your email change.",
      });

      onClose();
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg relative">
        <button className="absolute right-4 top-4" onClick={onClose}>
          <X size={20} className="text-gray-500" />
        </button>

        <h2 className="text-xl font-semibold mb-4">Change Email Address</h2>

        {error && (
          <p className="text-red-600 text-sm mb-3 bg-red-50 p-2 rounded">
            {error}
          </p>
        )}

        <form onSubmit={handleUpdateEmail} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">New Email</label>
            <input
              type="email"
              className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Current Password</label>
            <input
              type="password"
              className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Email"}
          </button>
        </form>
      </div>
    </div>
  );
}
