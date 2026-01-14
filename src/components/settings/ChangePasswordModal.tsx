import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";
import { passwordSchema } from "@/lib/schemas";

type PasswordFormData = z.infer<typeof passwordSchema>;

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
}: ChangePasswordModalProps) {
  const { toast } = useToast();
  const { data: session } = authClient.useSession();
  const user = session?.user;

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
    if (!user?.email) return;

    try {
      // Better Auth handles the "current password" check internally
      const { error } = await authClient.changePassword({
        newPassword: data.newPassword,
        currentPassword: data.currentPassword,
        revokeOtherSessions: true, // Recommended for security
      });

      if (error) {
        setError("root", {
          message: error.message || "Failed to update password",
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
      setError("root", { message: "Something went wrong. Try again." });
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
