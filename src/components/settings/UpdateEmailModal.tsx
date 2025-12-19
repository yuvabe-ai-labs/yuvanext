import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { X, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { updateEmailSchema } from "@/lib/schemas";

type UpdateEmailFormData = z.infer<typeof updateEmailSchema>;

interface UpdateEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpdateEmailModal({
  isOpen,
  onClose,
}: UpdateEmailModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const currentEmail = user?.email || "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<UpdateEmailFormData>({
    resolver: zodResolver(updateEmailSchema),
    defaultValues: {
      currentEmail,
      newEmail: "",
      password: "",
    },
  });

  useEffect(() => {
    if (isOpen && currentEmail) {
      reset({
        currentEmail,
        newEmail: "",
        password: "",
      });
    }
  }, [isOpen, currentEmail, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: UpdateEmailFormData) => {
    if (!user?.email) {
      setError("root", {
        message: "Unable to get user. Please login again.",
      });
      return;
    }

    try {
      // Re-authenticate user
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: data.currentEmail,
        password: data.password,
      });

      if (reauthError) {
        setError("password", { message: "Incorrect password." });
        return;
      }

      // Update email
      const { error: updateErr } = await supabase.auth.updateUser(
        { email: data.newEmail },
        {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      );

      if (updateErr) {
        setError("root", { message: updateErr.message });
        return;
      }

      toast({
        title: "Verification email sent",
        description:
          "Please check your new email inbox and confirm the change.",
        duration: 8000,
      });

      reset();
      onClose();
    } catch (error) {
      console.error(error);
      setError("root", {
        message: "Something went wrong. Please try again.",
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

        <h2 className="text-xl font-semibold mb-4">Change Email Address</h2>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-xs text-blue-800">
            <strong>Important:</strong> A confirmation email will be sent to
            your new email address.
          </p>
        </div>

        {errors.root && (
          <p className="text-red-600 text-sm mb-3 bg-red-50 p-2 rounded">
            {errors.root.message}
          </p>
        )}

        {/* Hidden field required for Zod refine */}
        <input type="hidden" {...register("currentEmail")} />

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 block mb-1">
              Current Email
            </label>
            <input
              type="email"
              value={currentEmail}
              disabled
              className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 block mb-1">
              New Email
            </label>
            <input
              type="email"
              {...register("newEmail")}
              className={`w-full border rounded-lg px-3 py-2 text-sm ${
                errors.newEmail ? "border-red-500" : ""
              }`}
              placeholder="Enter new email"
            />
            {errors.newEmail && (
              <p className="text-red-600 text-xs mt-1">
                {errors.newEmail.message}
              </p>
            )}
          </div>

          <div className="relative">
            <label className="text-sm text-gray-600 block mb-1">
              Current Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              className={`w-full border rounded-lg px-3 py-2 pr-10 text-sm ${
                errors.password ? "border-red-500" : ""
              }`}
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-500"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            {errors.password && (
              <p className="text-red-600 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50 hover:bg-blue-700"
          >
            {isSubmitting ? "Sending verification email..." : "Update Email"}
          </button>
        </div>
      </div>
    </div>
  );
}
