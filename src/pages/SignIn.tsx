import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { authClient } from "@/lib/auth-client";
import { useToast } from "@/components/ui/use-toast";
import signupIllustrate from "@/assets/signinillustion.png";
import signinLogo from "@/assets/signinLogo.svg";
import { Eye, EyeOff } from "lucide-react";
import { Arrow } from "@/components/ui/custom-icons";
import unitIllustration from "@/assets/unit_illstration.png";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  keepLoggedIn: z.boolean().default(false),
});

type SignInValues = z.infer<typeof signInSchema>;

const SignIn = () => {
  const { role } = useParams<{ role: string }>();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      keepLoggedIn: false,
    },
  });

  const illustrationText =
    role === "unit"
      ? "AI-driven analysis identifies the candidate whose skills, experience, and behavioral traits most closely align with the role’s requirements."
      : "At YuvaNext, we focus on helping young adults take their next step through internships, courses, and real-world opportunities.";

  const onSubmit = async (values: SignInValues) => {
    setLoading(true);

    const { data, error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
      rememberMe: values.keepLoggedIn,
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
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    } else if (data) {
      const userRole = data.user.role;

      if (userRole !== role) {
        await authClient.signOut();

        toast({
          title: "Sign in failed",
          description: `This sign-in page is for ${role}s only. Please use the correct sign-in page for your account type.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });

        if (userRole === "unit") {
          navigate("/unit-dashboard");
        } else {
          navigate("/dashboard");
        }
      }
    }

    setLoading(false);
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

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <label
                        htmlFor="email"
                        className="block text-[14px] mb-2"
                        style={{ color: "#4B5563" }}
                      >
                        Email Address *
                      </label>
                      <FormControl>
                        <div className="border border-[#D1D5DB] rounded-lg h-8 px-4 py-4 flex items-center">
                          <input
                            {...field}
                            id="email"
                            type="email"
                            placeholder="Enter email address"
                            className="w-full text-[13px] outline-none bg-transparent placeholder-[#D1D5DB]"
                            disabled={loading}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px] mt-1" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <label
                        htmlFor="password"
                        className="block text-[14px] mb-2"
                        style={{ color: "#4B5563" }}
                      >
                        Password *
                      </label>
                      <FormControl>
                        <div className="border border-[#D1D5DB] rounded-lg h-8 px-4 py-4 flex items-center gap-2">
                          <input
                            {...field}
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="w-full text-[13px] outline-none bg-transparent placeholder-[#D1D5DB]"
                            disabled={loading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-[#9CA3AF] hover:text-[#4B5563] transition-colors disabled:opacity-50"
                            disabled={loading}
                          >
                            {showPassword ? (
                              <EyeOff size={14} />
                            ) : (
                              <Eye size={14} />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px] mt-1" />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between">
                  <FormField
                    control={form.control}
                    name="keepLoggedIn"
                    render={({ field }) => (
                      <div className="flex items-center gap-2">
                        <input
                          id="keepLoggedIn"
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
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
                    )}
                  />
                  <Link
                    to="/forgot-password"
                    className="text-[13px] hover:underline"
                    style={{ color: "#3F83F8" }}
                  >
                    Forgot Password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[35px] rounded-lg flex items-center justify-center text-[14px] font-medium text-white hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: "#76A9FA" }}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </Form>

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
