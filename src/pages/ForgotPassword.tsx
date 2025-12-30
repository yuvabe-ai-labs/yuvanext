import { useState } from "react";
import { Link } from "react-router-dom";
import { authClient } from "@/lib/auth-client";
import { useToast } from "@/hooks/use-toast";
import signupIllustrate from "@/assets/signinillustion.png";
import signinLogo from "@/assets/signinLogo.svg";
import { ArrowLeft } from "lucide-react";
import CheckEmail from "../components/CheckEmail";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: authError } = await authClient.requestPasswordReset({
        email: email,
        redirectTo: `${
          import.meta.env.VITE_BETTER_AUTH_REDIRECT_URL
        }/reset-password`,
      });

      if (authError) {
        if (authError.status === 404) {
          setError("User not found. Please check the email address.");
        } else if (authError.status === 429) {
          setError("Too many attempts. Please try again later.");
        } else if (authError.status === 400 || authError.status === 422) {
          setError("Invalid email address format.");
        } else {
          toast({
            title: "Error",
            description: authError.message || "Failed to send reset link",
            variant: "destructive",
          });
        }
        setLoading(false);
        return;
      }

      // Success: Switch UI instead of navigating
      setIsSubmitted(true);
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

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Illustration (Static) */}
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

      {/* Right Side - Conditional Content */}
      <div className="flex-1 flex items-center justify-center bg-white px-4 sm:px-6">
        <div className="w-full max-w-[474px]">
          <div className="bg-white rounded-[15px] px-6 sm:px-12 md:px-[40px] py-8 sm:py-12 w-full">
            {!isSubmitted ? (
              // 1. FORM VIEW
              <>
                <div className="text-center mb-8">
                  <h1
                    className="text-[24px] font-bold leading-[35px] mb-2"
                    style={{
                      color: "#1F2A37",
                      fontFamily: "'Neue Haas Grotesk Text Pro', sans-serif",
                    }}
                  >
                    Forgot Password?
                  </h1>
                  <p
                    className="text-[14px] leading-[15px]"
                    style={{
                      color: "#9CA3AF",
                      fontFamily: "'Neue Haas Grotesk Text Pro', sans-serif",
                    }}
                  >
                    Don’t worry, we’ll send you reset instructions
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-[14px] mb-2"
                      style={{ color: "#4B5563" }}
                    >
                      Email Address *
                    </label>
                    <div
                      className={`border ${
                        error ? "border-red-500" : "border-[#D1D5DB]"
                      } rounded-lg h-10 px-4 flex items-center`}
                    >
                      <input
                        id="email"
                        type="email"
                        placeholder="Enter email address"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError("");
                        }}
                        className="w-full text-[13px] outline-none bg-transparent placeholder-[#9CA3AF]"
                        required
                      />
                    </div>
                    {error && (
                      <p className="text-[12px] text-red-500 mt-1">{error}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-[40px] rounded-lg flex items-center justify-center text-[14px] font-medium text-white hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: "#76A9FA" }}
                  >
                    {loading ? "Sending..." : "Send Password Reset Link"}
                  </button>

                  <Link
                    to="/auth/student/signin"
                    className="w-full h-[40px] rounded-lg flex items-center justify-center text-[14px] font-medium border border-[#D1D5DB] hover:bg-gray-50 transition-colors gap-2"
                    style={{ color: "#3F83F8" }}
                  >
                    <ArrowLeft size={16} />
                    Back to Sign In Page
                  </Link>
                </form>
              </>
            ) : (
              // 2. SUCCESS (CHECK EMAIL) VIEW
              <CheckEmail />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
