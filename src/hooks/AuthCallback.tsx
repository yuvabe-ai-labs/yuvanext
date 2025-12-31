import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authClient } from "@/lib/auth-client";
import { useToast } from "@/components/ui/use-toast";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log("Auth callback triggered");

        // Check the URL hash for the type parameter
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const type = hashParams.get("type");
        const accessToken = hashParams.get("access_token");

        // If this is a password recovery, redirect to reset password page with the token
        if (type === "recovery" && accessToken) {
          console.log(
            "Password recovery detected, redirecting to reset password"
          );
          navigate("/reset-password" + window.location.hash, { replace: true });
          return;
        }

        // Get the session from Better Auth
        const { data: sessionData, error } = await authClient.getSession();

        if (error) {
          console.error("Error getting session:", error);
          toast({
            title: "Authentication Error",
            description: error.message || "Failed to authenticate",
            variant: "destructive",
          });
          navigate("/auth/student/signin");
          return;
        }

        if (sessionData?.session) {
          console.log("User authenticated successfully:", sessionData.user?.id);
          toast({
            title: "Email Verified!",
            description:
              "Your account has been verified successfully. Let's set up your profile!",
          });

          // Wait a moment for the auth state to propagate
          setTimeout(() => {
            navigate("/chatbot", { replace: true });
          }, 1000);
        } else {
          console.log("No session found, redirecting to signin");
          toast({
            title: "Verification Complete",
            description: "Please sign in to continue.",
          });
          navigate("/auth/student/signin");
        }
      } catch (error: any) {
        console.error("Callback error:", error);
        toast({
          title: "Error",
          description: "Something went wrong. Please try signing in.",
          variant: "destructive",
        });
        navigate("/auth/student/signin");
      }
    };

    handleCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-muted">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <div className="text-lg font-medium">Verifying your email...</div>
        <div className="text-sm text-muted-foreground">
          Please wait a moment
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
