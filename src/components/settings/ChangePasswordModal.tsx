import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { X, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { passwordSchema } from "@/lib/schemas";

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ChangePasswordModal({ isOpen, onClose }) {
  const { toast } = useToast();
  const { user } = useAuth();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  if (!isOpen) return null;

  const onSubmit = async (data: PasswordFormData) => {
    if (!user?.email) {
      setError("root", {
        message: "Unable to fetch user. Please login again.",
      });
      return;
    }

    try {
      // Step 1 – Re-authenticate
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: data.currentPassword,
      });

      if (signInErr) {
        setError("currentPassword", {
          message: "Current password is incorrect.",
        });
        return;
      }

      // Step 2 – Update password
      const { error: updateErr } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (updateErr) {
        setError("root", {
          message: updateErr.message,
        });
        return;
      }

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });

      reset();
      onClose();
    } catch (err) {
      console.error(err);
      setError("root", {
        message: "Something went wrong. Try again.",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg relative">
        <button
          className="absolute right-4 top-4"
          onClick={onClose}
          type="button"
        >
          <X size={20} className="text-gray-500" />
        </button>

        <h2 className="text-xl font-semibold mb-4">Change Password</h2>

        {errors.root && (
          <p className="text-red-600 text-sm mb-3 bg-red-50 p-2 rounded">
            {errors.root.message}
          </p>
        )}

        <div className="space-y-4">
          {/* Current Password */}
          <div className="relative">
            <label className="text-sm block mb-1">Current Password</label>
            <input
              type={showCurrent ? "text" : "password"}
              className={`w-full border rounded-lg px-3 py-2 pr-10 ${
                errors.currentPassword ? "border-red-500" : ""
              }`}
              {...register("currentPassword")}
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-9"
            >
              {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {errors.currentPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          {/* New Password */}
          <div className="relative">
            <label className="text-sm block mb-1">New Password</label>
            <input
              type={showNew ? "text" : "password"}
              className={`w-full border rounded-lg px-3 py-2 pr-10 ${
                errors.newPassword ? "border-red-500" : ""
              }`}
              {...register("newPassword")}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-9"
            >
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {errors.newPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <label className="text-sm block mb-1">Confirm New Password</label>
            <input
              type={showConfirm ? "text" : "password"}
              className={`w-full border rounded-lg px-3 py-2 pr-10 ${
                errors.confirmNewPassword ? "border-red-500" : ""
              }`}
              {...register("confirmNewPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-9"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {errors.confirmNewPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmNewPassword.message}
              </p>
            )}
          </div>

          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors"
          >
            {isSubmitting ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
}
