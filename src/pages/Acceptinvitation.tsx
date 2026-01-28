import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { CheckCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { env } from "@/env";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import signupIllustrate from "@/assets/signinillustion.png";
import signinLogo from "@/assets/signinLogo.svg";
import unitIllustration from "@/assets/unit_illstration.png";
import { Arrow } from "@/components/ui/custom-icons";
import z from "zod";
import { acceptInvitationSchema } from "@/lib/schemas";

const API_BASE_URL = `${env.VITE_API_URL}/api`;

interface InvitationData {
  invitationId: string;
  email: string;
  companyName: string;
}

const AcceptInvitation = () => {
  const [searchParams] = useSearchParams();
  const invitationId = searchParams.get("id");
  const navigate = useNavigate();
  const { toast } = useToast();

  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
  const [verifying, setVerifying] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  type AcceptInvitationFormValues = z.infer<typeof acceptInvitationSchema>;

  const form = useForm<AcceptInvitationFormValues>({
    resolver: zodResolver(acceptInvitationSchema),
    defaultValues: {
      password: "",
    },
  });

  const { watch } = form;
  const passwordValue = watch("password");

  const passwordRules = [
    { label: "one lowercase character", test: (p: string) => /[a-z]/.test(p) },
    { label: "one uppercase character", test: (p: string) => /[A-Z]/.test(p) },
    { label: "one number", test: (p: string) => /\d/.test(p) },
    { label: "one special character", test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
    { label: "8 character minimum", test: (p: string) => p.length >= 8 },
  ];

  useEffect(() => {
    const verify = async () => {
      if (!invitationId) {
        setVerifying(false);
        return;
      }
      try {
        const { data } = await axios.get(`${API_BASE_URL}/auth/verify-invitation`, {
          params: { id: invitationId },
        });
        setInvitationData(data.data);
      } catch (error: any) {
        toast({
          title: "Verification Failed",
          description: error.response?.data?.message || "Invalid or expired link.",
          variant: "destructive",
        });
      } finally {
        setVerifying(false);
      }
    };
    verify();
  }, [invitationId, toast]);

  const onSubmit = async (values: AcceptInvitationFormValues) => {
    try {
      await axios.post(`${API_BASE_URL}/auth/accept-invitation`, {
        invitationId,
        password: values.password,
      });

      toast({ title: "Account created successfully!" });
      setTimeout(() => navigate("/auth/unit/signin"), 2000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex w-[41%] h-screen relative p-4">
        <div className="w-full h-full rounded-3xl overflow-hidden relative">
          <img src={signupIllustrate} alt="Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-6 px-8">
            <img src={signinLogo} alt="Logo" className="w-32" />
            <div className="relative flex items-center justify-center p-6">
              <Arrow className="absolute w-[650px] h-[650px] text-white opacity-95 bottom-10" />
              <img src={unitIllustration} alt="Unit" className="relative z-10 w-[450px]" />
            </div>
            <p className="text-white text-base max-w-xl">
              AI-driven analysis identifies the candidate whose skills closely align with requirements.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-[474px]">
          <div className="px-6 sm:px-12 py-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-[#1F2A37]">Complete your profile</h1>
              <p className="text-sm text-[#9CA3AF]">
                {invitationData ? `Welcome, ${invitationData.companyName}` : "Enter details below"}
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      value={invitationData?.email || ""} 
                      readOnly 
                      className="bg-gray-50 text-gray-400 cursor-not-allowed" 
                    />
                  </FormControl>
                </FormItem>

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Set Password *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </Button>
                        </div>
                      </FormControl>
                      
                      {passwordValue && (
                        <ul className="mt-3 grid grid-cols-2 gap-2">
                          {passwordRules.map((rule, idx) => {
                            const passed = rule.test(passwordValue);
                            return (
                              <li key={idx} className={`flex items-center gap-2 text-xs ${passed ? "text-green-600" : "text-gray-400"}`}>
                                {passed ? <CheckCircle size={14} /> : <div className="w-3.5 h-3.5 border rounded-full" />}
                                {rule.label}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting || !invitationData}
                  className="w-full bg-[#76A9FA] hover:bg-[#76A9FA]/90"
                >
                  {form.formState.isSubmitting ? "Creating account..." : "Accept Invitation"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvitation;