import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { env } from "@/env";
import { CheckCircle, Eye, EyeOff } from "lucide-react";
import signupIllustrate from "@/assets/signinillustion.png";
import signinLogo from "@/assets/signinLogo.svg";
import { Arrow } from "@/components/ui/custom-icons";
import unitIllustration from "@/assets/unit_illstration.png";

const API_BASE_URL = `${env.VITE_API_URL}/api`;

interface InvitationData {
  invitationId: string;
  email: string;
  companyName: string;
  companyType: string;
  industryType: string;
}

const AcceptInvitation = () => {
  const [searchParams] = useSearchParams();
  const invitationId = searchParams.get("id");
  
  // Fixed the useState syntax error here
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();

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

  useEffect(() => {
    const verifyInvitation = async () => {
      if (!invitationId) {
        toast({
          title: "Invalid Link",
          description: "No invitation ID found in the URL.",
          variant: "destructive",
        });
        setVerifying(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/verify-invitation?id=${invitationId}`);
        const result = await response.json();

        if (response.ok && result.status_code === 200) {
          setInvitationData(result.data);
        } else {
          throw new Error(result.message || "Failed to verify invitation");
        }
      } catch (err: any) {
        toast({
          title: "Verification Failed",
          description: err.message || "The invitation link is invalid or expired.",
          variant: "destructive",
        });
      } finally {
        setVerifying(false);
      }
    };

    verifyInvitation();
  }, [invitationId, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isPasswordValid = passwordRules.every((rule) => rule.test(password));
    if (!isPasswordValid) {
      toast({
        title: "Password requirements not met",
        description: "Please ensure your password meets all requirements.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/accept-invitation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invitationId: invitationId,
          password: password,
        }),
      });

      const result = await response.json();

      if (response.ok && result.status_code === 201) {
        toast({
          title: "Account created successfully!",
          description: "You can now sign in to your account.",
        });
        
        setTimeout(() => {
          navigate("/auth/unit/signin");
        }, 2000);
      } else {
        throw new Error(result.message || "Failed to accept invitation");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-[#76A9FA] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium">Verifying invitation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex w-[41%] h-screen relative p-4">
        <div className="w-full h-full rounded-3xl overflow-hidden relative">
          <img
            src={signupIllustrate}
            alt="Illustration"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-6 px-8">
            <img src={signinLogo} alt="Logo" className="w-32 h-auto" />
            <div className="relative flex items-center justify-center p-6">
              <Arrow className="absolute w-[650px] h-[650px] text-white opacity-95 bottom-10" />
              <img
                src={unitIllustration}
                alt="Unit Illustration"
                className="relative z-10 w-[450px] h-[450px] object-contain"
              />
            </div>
            <p className="text-white text-base font-medium max-w-xl leading-relaxed">
              AI-driven analysis identifies the candidate whose skills, experience, and behavioral traits most closely align with the role's requirements.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-4 sm:px-6">
        <div className="w-full max-w-[474px]">
          <div className="bg-white rounded-[15px] px-6 sm:px-12 md:px-[40px] py-8 sm:py-12 w-full">
            <div className="text-center mb-8">
              <h1 className="text-[24px] font-bold leading-[35px] mb-2 text-[#1F2A37] font-['Neue_Haas_Grotesk_Text_Pro']">
                Complete your profile
              </h1>
              <p className="text-[14px] leading-[15px] text-[#9CA3AF] font-['Neue_Haas_Grotesk_Text_Pro']">
                {invitationData ? `Welcome, ${invitationData.companyName}` : "Enter your details below"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[14px] mb-2 text-[#4B5563]">
                  Email Address
                </label>
                <div className="border border-[#D1D5DB] bg-gray-50 rounded-lg h-8 px-4 py-4 flex items-center">
                  <input
                    type="email"
                    value={invitationData?.email || ""}
                    className="w-full text-[13px] outline-none bg-transparent text-gray-400 cursor-not-allowed"
                    readOnly
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-[14px] mb-2 text-[#4B5563]">
                  Set Password *
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
                
                {password && (
                  <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[12px]">
                    {passwordRules.map((rule, index) => {
                      const passed = rule.test(password);
                      return (
                        <li key={index} className={`flex items-center gap-1 ${passed ? "text-green-600" : "text-gray-400"}`}>
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
                disabled={loading || !invitationData}
                className="w-full h-[35px] rounded-lg flex items-center justify-center text-[14px] font-medium text-white transition-colors bg-[#76A9FA] hover:opacity-90 disabled:opacity-50 font-['Neue_Haas_Grotesk_Text_Pro']"
              >
                {loading ? "Creating account..." : "Accept Invitation"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvitation;