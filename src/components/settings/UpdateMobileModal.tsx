import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProfileData } from "@/hooks/useProfileData";

export default function UpdateMobileModal({ isOpen, onClose }) {
  const { toast } = useToast();

  const { profile, updateProfile, refetch } = useProfileData();

  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  // Load profile mobile into input
  useEffect(() => {
    if (profile?.phone) {
      setPhone(profile.phone);
    }
  }, [profile]);

  if (!isOpen) return null;

  const handleUpdatePhone = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile({ phone });

      toast({
        title: "Mobile Updated",
        description: "Your mobile number has been updated successfully.",
      });

      refetch(); // refresh profile
      onClose();
    } catch (err) {
      console.error("Error updating mobile:", err);

      toast({
        title: "Error",
        description: "Failed to update mobile number.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg relative">
        {/* Close Button */}
        <button
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Update Mobile Number
        </h2>

        <form onSubmit={handleUpdatePhone} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Mobile Number</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 mt-1 text-sm"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Mobile"}
          </button>
        </form>
      </div>
    </div>
  );
}
