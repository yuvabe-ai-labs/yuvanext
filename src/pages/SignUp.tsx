import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { authClient } from "@/lib/auth-client";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, Eye, EyeOff } from "lucide-react";
import { Arrow } from "@/components/ui/custom-icons";
import signupIllustrate from "@/assets/signinillustion.png";
import signinLogo from "@/assets/signinLogo.svg";
import unitIllustration from "@/assets/unit_illstration.png";

const SignUp = () => {
  const { role } = useParams<{ role: string }>();
  const [fullName, setFullName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const isUnitRole = role === "unit";

  const illustrationText = isUnitRole
    ? "AI-driven analysis identifies the candidate whose skills, experience, and behavioral traits most closely align with the role's requirements."
    : "At YuvaNext, we focus on helping young adults take their next step through internships, courses, and real-world opportunities.";

  // Password validation rules
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password
    const isPasswordValid = passwordRules.every((rule) => rule.test(password));
    if (!isPasswordValid) {
      toast({
        title: "Password requirements not met",
        description: "Please ensure your password meets all requirements.",
        variant: "destructive",
      });
      return;
    }

    if (isUnitRole && companyWebsite) {
      try {
        new URL(companyWebsite);
      } catch {
        toast({
          title: "Invalid website URL",
          description: "Please enter a valid URL (e.g., https://example.com)",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    const finalRole = role === "student" ? "candidate" : role;

    // 2. USE BETTER AUTH SIGN UP
    const { data, error } = await authClient.signUp.email({
      email: email,
      password: password,
      name: fullName,
      metadata: {
        role: finalRole,
        companyWebsite: isUnitRole ? companyWebsite : undefined,
      },
    });

    if (error) {
      // Check for specific error messages (Better Auth API structure)
      if (error.status === 409) {
        // Status 409: Conflict (User already exists)
        toast({
          title: "Account already exists",
          description:
            "This email is already registered. Please sign in instead.",
          variant: "destructive",
        });
      } else if (error.status === 429) {
        // Status 429: Rate Limit
        toast({
          title: "Too many attempts",
          description: "Please wait a moment before trying again.",
          variant: "destructive",
        });
      } else {
        // Fallback for 500 or 400
        toast({
          title: "Sign up failed",
          description: error.message || "An unknown error occurred.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Account created successfully!",
        description:
          "Please check your email to verify your account then sign in to continue.",
      });

      // Redirect to sign-in page after successful signup
      setTimeout(() => {
        navigate(`/auth/${role || "student"}/signin`);
      }, 2000);
    }

    setLoading(false);
  };

  // 3. UPDATED OAUTH HANDLER (Though currently unused in your JSX)
  const handleOAuthSignUp = async (provider: "google" | "apple") => {
    if (role) {
      localStorage.setItem("pendingRole", role);
    }

    await authClient.signIn.social({
      provider: provider,
      callbackURL: `/auth/${role || "student"}/signin`, // Optional: where to go after auth
    });
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex w-[41%] h-screen relative p-4">
        <div className="w-full h-full rounded-3xl overflow-hidden relative">
          <img
            src={signupIllustrate}
            alt="Signin Illustration"
            className="w-full h-full object-cover"
          />

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-6 px-8">
            <img src={signinLogo} alt="Sign in Logo" className="w-32 h-auto" />

            {isUnitRole && (
              <div className="relative flex items-center justify-center p-6">
                <Arrow className="absolute w-[650px] h-[650px] text-white opacity-95 bottom-10" />
                <img
                  src={unitIllustration}
                  alt="Unit Illustration"
                  className="relative z-10 w-[450px] h-[450px] object-contain"
                />
              </div>
            )}

            <p className="text-white text-base font-medium max-w-xl leading-relaxed">
              {illustrationText}
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

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-4 sm:px-6">
        <div className="w-full max-w-[474px]">
          <div className="bg-white rounded-[15px] px-6 sm:px-12 md:px-[40px] py-8 sm:py-12 w-full">
            <div className="text-center mb-8">
              <h1
                className="text-[24px] font-bold leading-[35px] mb-2"
                style={{
                  color: "#1F2A37",
                  fontFamily: "'Neue Haas Grotesk Text Pro', sans-serif",
                }}
              >
                Create your account
              </h1>
              <p
                className="text-[14px] leading-[15px]"
                style={{
                  color: "#9CA3AF",
                  fontFamily: "'Neue Haas Grotesk Text Pro', sans-serif",
                }}
              >
                Please enter your details below
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-[14px] leading-[11px] mb-2"
                  style={{
                    color: "#4B5563",
                    fontFamily: "'Neue Haas Grotesk Text Pro', sans-serif",
                  }}
                >
                  {isUnitRole ? "Company Name *" : "Full Name *"}
                </label>
                <div className="border border-[#D1D5DB] rounded-lg h-8 px-4 py-4 flex items-center">
                  <input
                    id="fullName"
                    type="text"
                    placeholder={
                      isUnitRole ? "Enter company name" : "Enter name"
                    }
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full text-[13px] leading-[11px] outline-none bg-transparent placeholder-[#9CA3AF]"
                    style={{
                      fontFamily: "'Neue Haas Grotesk Text Pro', sans-serif",
                    }}
                    required
                  />
                </div>
              </div>

              {/* Company Website */}
              {isUnitRole && (
                <div>
                  <label
                    htmlFor="companyWebsite"
                    className="block text-[14px] leading-[11px] mb-2"
                    style={{
                      color: "#4B5563",
                      fontFamily: "'Neue Haas Grotesk Text Pro', sans-serif",
                    }}
                  >
                    Company Website
                  </label>
                  <div className="border border-[#D1D5DB] rounded-lg h-8 px-4 py-4 flex items-center">
                    <input
                      id="companyWebsite"
                      type="url"
                      placeholder="https://example.com"
                      value={companyWebsite}
                      onChange={(e) => setCompanyWebsite(e.target.value)}
                      className="w-full text-[13px] leading-[11px] outline-none bg-transparent placeholder-[#9CA3AF]"
                      style={{
                        fontFamily: "'Neue Haas Grotesk Text Pro', sans-serif",
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-[14px] leading-[11px] mb-2"
                  style={{
                    color: "#4B5563",
                    fontFamily: "'Neue Haas Grotesk Text Pro', sans-serif",
                  }}
                >
                  Email Address *
                </label>
                <div className="border border-[#D1D5DB] rounded-lg h-8 px-4 py-4 flex items-center">
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-[13px] leading-[11px] outline-none bg-transparent placeholder-[#9CA3AF]"
                    style={{ fontFamily: "'Lato', sans-serif" }}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-[12px] mb-2"
                  style={{ color: "#4B5563" }}
                >
                  Password *
                </label>
                <div className="border border-[#D1D5DB] rounded-lg h-8 px-4 py-4 flex items-center gap-2">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-[13px] outline-none bg-transparent placeholder-[#9CA3AF]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#9CA3AF] hover:text-[#4B5563] transition-colors"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {/* Password strength checklist (2 columns) */}
                {password && (
                  <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[12px]">
                    {passwordRules.map((rule, index) => {
                      const passed = rule.test(password);
                      return (
                        <li
                          key={index}
                          className={`flex items-center gap-1 ${
                            passed ? "text-green-600" : "text-gray-400"
                          }`}
                        >
                          {passed ? (
                            <CheckCircle size={12} className="text-green-600" />
                          ) : (
                            <span className="w-[12px] h-[12px] border border-gray-300 rounded-full" />
                          )}
                          <span>{rule.label}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[35px] rounded-lg flex items-center justify-center text-[14px] font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
                style={{
                  backgroundColor: "#76A9FA",
                  fontFamily: "'Neue Haas Grotesk Text Pro', sans-serif",
                }}
              >
                {loading ? "Creating account..." : "Sign up"}
              </button>
            </form>

            <div className="text-center mt-6">
              <span
                className="text-[13px] leading-4"
                style={{
                  color: "#9CA3AF",
                  fontFamily: "'Neue Haas Grotesk Text Pro', sans-serif",
                }}
              >
                Already have an account?{" "}
                <Link
                  to={`/auth/${role}/signin`}
                  className="text-[14px] leading-4 font-medium hover:underline"
                  style={{
                    color: "#3F83F8",
                    fontFamily: "'Neue Haas Grotesk Text Pro', sans-serif",
                  }}
                >
                  Sign In
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
