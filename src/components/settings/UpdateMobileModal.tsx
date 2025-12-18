import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProfileData } from "@/hooks/useProfileData";
import { phoneSchema } from "@/lib/schemas";

type PhoneFormData = z.infer<typeof phoneSchema>;

export default function UpdateMobileModal({ isOpen, onClose }) {
  const { toast } = useToast();
  const { profile, updateProfile, refetch } = useProfileData();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PhoneFormData>({
    resolver: zodResolver(phoneSchema),
  });

  // Load profile mobile into form
  useEffect(() => {
    if (profile?.phone) {
      reset({ phone: profile.phone });
    }
  }, [profile, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data: PhoneFormData) => {
    try {
      await updateProfile({ phone: data.phone });

      toast({
        title: "Mobile Updated",
        description: "Your mobile number has been updated successfully.",
      });

      refetch();
      onClose();
    } catch (err) {
      console.error("Error updating mobile:", err);

      toast({
        title: "Error",
        description: "Failed to update mobile number.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg relative">
        <button
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          type="button"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Update Mobile Number
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 block mb-1">
              Mobile Number
            </label>
            <input
              type="text"
              className={`w-full border rounded-lg px-3 py-2 text-sm ${
                errors.phone ? "border-red-500" : ""
              }`}
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors"
          >
            {isSubmitting ? "Updating..." : "Update Mobile"}
          </button>
        </form>
      </div>
    </div>
  );
}
