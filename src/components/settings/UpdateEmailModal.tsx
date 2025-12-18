import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { updateEmailSchema } from "@/lib/schemas";

type UpdateEmailFormData = z.infer<typeof updateEmailSchema>;

export default function UpdateEmailModal({ isOpen, onClose }) {
  const { toast } = useToast();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    watch,
  } = useForm<UpdateEmailFormData>({
    resolver: zodResolver(updateEmailSchema),
    defaultValues: {
      newEmail: "",
      password: "",
    },
  });

  const currentEmail = user?.email || "";
  const newEmail = watch("newEmail");

  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: UpdateEmailFormData) => {
    if (!user?.email) {
      setError("root", {
        message: "Unable to get user. Please login again.",
      });
      return;
    }

    // Validate that new email is different
    if (data.newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      setError("newEmail", {
        message: "New email must be different from current email.",
      });
      return;
    }

    try {
      // Re-authenticate the user to verify password
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: currentEmail,
        password: data.password,
      });

      if (reauthError) {
        setError("password", {
          message: "Incorrect password.",
        });
        return;
      }

      // Request email change
      const { error: updateErr } = await supabase.auth.updateUser(
        { email: data.newEmail },
        {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      );

      if (updateErr) {
        setError("root", {
          message: updateErr.message,
        });
        return;
      }

      toast({
        title: "Verification email sent",
        description:
          "Please check your new email inbox and click the confirmation link to complete the email change.",
        duration: 8000,
      });

      reset();
      onClose();
    } catch (err) {
      console.error(err);
      setError("root", {
        message: "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg relative">
        <button className="absolute right-4 top-4" onClick={onClose}>
          <X size={20} className="text-gray-500" />
        </button>

        <h2 className="text-xl font-semibold mb-4">Change Email Address</h2>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-xs text-blue-800">
            <strong>Important:</strong> You'll receive a confirmation email at
            your new email address. Click the link in the email to complete the
            email change.
          </p>
        </div>

        {errors.root && (
          <p className="text-red-600 text-sm mb-3 bg-red-50 p-2 rounded">
            {errors.root.message}
          </p>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 block mb-1">
              Current Email
            </label>
            <input
              type="email"
              className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50"
              value={currentEmail}
              disabled
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 block mb-1">
              New Email
            </label>
            <input
              type="email"
              className={`w-full border rounded-lg px-3 py-2 text-sm ${
                errors.newEmail ? "border-red-500" : ""
              }`}
              {...register("newEmail")}
              placeholder="Enter your new email address"
            />
            {errors.newEmail && (
              <p className="text-red-600 text-xs mt-1">
                {errors.newEmail.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-600 block mb-1">
              Current Password
            </label>
            <input
              type="password"
              className={`w-full border rounded-lg px-3 py-2 text-sm ${
                errors.password ? "border-red-500" : ""
              }`}
              {...register("password")}
              placeholder="Confirm your password"
            />
            {errors.password && (
              <p className="text-red-600 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors"
          >
            {isSubmitting ? "Sending verification email..." : "Update Email"}
          </button>
        </div>
      </div>
    </div>
  );
}
