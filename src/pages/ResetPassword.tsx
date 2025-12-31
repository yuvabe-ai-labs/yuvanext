import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// 1. IMPORT NUQS
import { useQueryState } from "nuqs";
import { authClient } from "@/lib/auth-client";
import { useToast } from "@/hooks/use-toast";
import signupIllustrate from "@/assets/signinillustion.png";
import signinLogo from "@/assets/signinLogo.svg";
import { Eye, EyeOff, Check, X } from "lucide-react";

const passwordRules = [
  { test: (p: string) => /[a-z]/.test(p), label: "one lowercase character" },
  { test: (p: string) => /[A-Z]/.test(p), label: "one uppercase character" },
  { test: (p: string) => /\d/.test(p), label: "one number" },
  {
    test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p),
    label: "one special character",
  },
  { test: (p: string) => p.length >= 8, label: "8 character minimum" },
];

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // 2. REPLACE MANUAL PARSING WITH NUQS HOOK
  // This automatically reads ?token=... from the URL
  const [token] = useQueryState("token");

  const { toast } = useToast();
  const navigate = useNavigate();

  const validatePassword = (password: string) =>
    passwordRules.every((rule) => rule.test(password));
  const passwordsMatch =
    newPassword === confirmPassword && confirmPassword !== "";

  // 3. SIMPLIFIED EFFECT (Only for error checking now)
  useEffect(() => {
    if (!token) {
      setError("Invalid or expired reset link. Please request a new one.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!validatePassword(newPassword)) {
      setError("Password does not meet all requirements");
      setLoading(false);
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!token) {
      setError("Missing reset token");
      setLoading(false);
      return;
    }

    try {
      const { data, error: resetError } = await authClient.resetPassword({
        newPassword: newPassword,
        token: token, // Uses the token from nuqs
      });

      if (resetError) {
        // ✅ Status 401 or 403: Invalid/Expired Token
        if (resetError.status === 401 || resetError.status === 403) {
          setError(
            "This link is invalid or expired. Please request a new one."
          );
        }
        // ✅ Status 429: Rate Limit
        else if (resetError.status === 429) {
          setError("Too many attempts. Please try again later.");
        } else {
          setError(resetError.message || "Failed to reset password");
        }
        setLoading(false);
        return;
      }

      setSuccess(true);
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
      });

      setTimeout(() => navigate("/auth/student/signin"), 2000);
    } catch (err) {
      console.error("Error:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  if (!token && !error) return null;

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-medium mb-2" style={{ color: "#1F2A37" }}>
            Password Updated Successfully!
          </h2>
          <p className="text-sm" style={{ color: "#9CA3AF" }}>
            Redirecting to sign in...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side Illustration */}
      <div className="hidden lg:flex w-[41%] h-screen relative p-4">
        <div className="w-full h-full rounded-3xl overflow-hidden relative">
          <img
            src={signupIllustrate}
            alt="Signin Illustration"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-6 px-8">
            <img src={signinLogo} alt="Sign in Logo" className="w-28 h-auto" />
            <p className="text-white text-base font-medium max-w-xl leading-relaxed">
              At YuvaNext, we focus on helping young adults take their next step
              through internships, courses, and real-world opportunities.
            </p>
          </div>
          <div className="absolute bottom-4 left-0 right-0 flex justify-between px-6 text-white/80 text-xs">
            <a
              href="https://www.yuvanext.com/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>

      {/* Right Side Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-6">
        <div className="w-full max-w-[474px]">
          <div className="bg-white rounded-[15px] px-12 py-10 w-full">
            <div className="text-center mb-8">
              <h1
                className="text-[22px] font-semibold leading-[35px] mb-2"
                style={{ color: "#1F2A37" }}
              >
                Reset Password
              </h1>
              <p
                className="text-[13px] leading-[18px]"
                style={{ color: "#9CA3AF" }}
              >
                Enter your new password below to regain access
              </p>
            </div>

            {error && (
              <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p
                  className="text-[11px] text-red-600"
                  style={{
                    fontFamily: "'Neue Haas Grotesk Text Pro', sans-serif",
                  }}
                >
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password */}
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-[13px] mb-2"
                  style={{ color: "#4B5563" }}
                >
                  New Password
                </label>
                <div className="border border-[#D1D5DB] rounded-lg h-9 px-4 flex items-center">
                  <input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError("");
                    }}
                    className="w-full text-[13px] outline-none bg-transparent placeholder-[#9CA3AF]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="ml-2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-[13px] mb-2"
                  style={{ color: "#4B5563" }}
                >
                  Confirm Password
                </label>
                <div className="border border-[#D1D5DB] rounded-lg h-9 px-4 flex items-center">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError("");
                    }}
                    className="w-full text-[13px] outline-none bg-transparent placeholder-[#9CA3AF]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="ml-2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Rules UI (unchanged logic, just layout) */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-2">
                {passwordRules.map((rule, idx) => {
                  const passed = rule.test(newPassword);
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full flex items-center justify-center ${
                          passed ? "bg-green-500" : "bg-gray-300"
                        }`}
                      >
                        {passed && <Check size={8} className="text-white" />}
                      </div>
                      <p
                        className="text-[11px]"
                        style={{ color: passed ? "#10B981" : "#9CA3AF" }}
                      >
                        {rule.label}
                      </p>
                    </div>
                  );
                })}
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full flex items-center justify-center ${
                      passwordsMatch ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    {passwordsMatch && (
                      <Check size={8} className="text-white" />
                    )}
                  </div>
                  <p
                    className="text-[11px]"
                    style={{ color: passwordsMatch ? "#10B981" : "#9CA3AF" }}
                  >
                    Passwords match
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={
                  loading || !validatePassword(newPassword) || !passwordsMatch
                }
                className="w-full h-[38px] rounded-lg flex items-center justify-center text-[13px] font-medium text-white hover:opacity-90 disabled:opacity-50 transition-all"
                style={{ backgroundColor: "#76A9FA" }}
              >
                {loading ? "Updating..." : "Reset Password"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/auth/student/signin")}
                className="w-full h-[38px] rounded-lg flex items-center justify-center text-[13px] font-medium border border-[#D1D5DB] hover:bg-gray-50 transition-all"
                style={{ color: "#76A9FA" }}
              >
                Back to Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
