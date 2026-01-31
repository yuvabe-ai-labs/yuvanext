import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { authClient } from "@/lib/auth-client";
import { useToast } from "@/components/ui/use-toast";
import signupIllustrate from "@/assets/signinillustion.png";
import signinLogo from "@/assets/signinLogo.svg";
import { Eye, EyeOff } from "lucide-react";
import { Arrow } from "@/components/ui/custom-icons";
import unitIllustration from "@/assets/unit_illstration.png";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignInFormValues, signInSchema } from "@/lib/authentication";

const SignIn = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);

  // 3. Initialize React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 4. Submit Handler
  const onSubmit = async (data: SignInFormValues) => {
    setLoading(true);

    const { data: authData, error } = await authClient.signIn.email({
      email: data.email,
      password: data.password,
      rememberMe: keepLoggedIn,
    });

    if (error) {
      let errorMessage =
        error.message || "Something went wrong. Please try again.";
      let errorTitle = "Sign in failed";

      if (error.status === 401) {
        errorMessage =
          "Incorrect email or password. Please check your credentials.";
      } else if (error.status === 403) {
        errorMessage =
          "Please check your email and verify your account before signing in.";
        errorTitle = "Verification Required";
      } else if (error.status === 429) {
        errorMessage = "Too many login attempts. Please try again later.";
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });

      const userRole = authData?.user?.role;

      if (userRole === "unit") {
        navigate("/unit-dashboard");
      } else {
        navigate("/dashboard");
      }
    }

    setLoading(false);
  };

  // Helper for UI
  const illustrationText =
    role === "unit"
      ? "AI-driven analysis identifies the candidate whose skills, experience, and behavioral traits most closely align with the role’s requirements."
      : "At YuvaNext, we focus on helping young adults take their next step through internships, courses, and real-world opportunities.";

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

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-6 px-8">
            <img src={signinLogo} alt="Sign in Logo" className="w-32 h-auto" />

            {role === "unit" && (
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
                  fontFamily:
                    "'Neue Haas Grotesk Text Pro', system-ui, sans-serif",
                }}
              >
                Sign in to your account
              </h1>
              <p
                className="text-[14px] leading-[15px]"
                style={{
                  color: "#9CA3AF",
                  fontFamily:
                    "'Neue Haas Grotesk Text Pro', system-ui, sans-serif",
                }}
              >
                Welcome back! Please enter your details below
              </p>
            </div>

            {/* Form Connected to RHF */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-[14px] mb-2"
                  style={{ color: "#4B5563" }}
                >
                  Email Address *
                </label>
                <div
                  className={`border rounded-lg h-8 px-4 py-4 flex items-center ${
                    errors.email ? "border-red-500" : "border-[#D1D5DB]"
                  }`}
                >
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    {...register("email")}
                    className="w-full text-[13px] outline-none bg-transparent placeholder-[#D1D5DB]"
                    disabled={loading}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-[10px] mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-[14px] mb-2"
                  style={{ color: "#4B5563" }}
                >
                  Password *
                </label>
                <div
                  className={`border rounded-lg h-8 px-4 py-4 flex items-center gap-2 ${
                    errors.password ? "border-red-500" : "border-[#D1D5DB]"
                  }`}
                >
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    {...register("password")}
                    className="w-full text-[13px] outline-none bg-transparent placeholder-[#D1D5DB]"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#9CA3AF] hover:text-[#4B5563] transition-colors disabled:opacity-50"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-[10px] mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Keep Logged In & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    id="keepLoggedIn"
                    type="checkbox"
                    checked={keepLoggedIn}
                    onChange={(e) => setKeepLoggedIn(e.target.checked)}
                    className="w-3 h-3 rounded border-[#D1D5DB] text-[#76A9FA] focus:ring-[#76A9FA] focus:ring-1"
                    disabled={loading}
                  />
                  <label
                    htmlFor="keepLoggedIn"
                    className="text-[13px] cursor-pointer"
                    style={{ color: "#4B5563" }}
                  >
                    Keep me logged in
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-[13px] hover:underline"
                  style={{ color: "#3F83F8" }}
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[35px] rounded-lg flex items-center justify-center text-[14px] font-medium text-white hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "#76A9FA" }}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="text-center mt-6">
              <span className="text-[13px]" style={{ color: "#9CA3AF" }}>
                Don't have an account?{" "}
                <Link
                  to={`/auth/${role}/signup`}
                  className="font-medium hover:underline"
                  style={{ color: "#3F83F8" }}
                >
                  Sign Up
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
