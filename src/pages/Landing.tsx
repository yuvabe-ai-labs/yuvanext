import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { env } from "@/env";
import { useSession } from "@/lib/auth-client";
import { useProfile } from "@/hooks/useProfile";
import PublicJobBoard from "./PublicJobBoard";

const Spinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-muted flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

// Mounted only when a session exists, so guests never trigger the profile
// request (a 401 there would force a sign-out redirect).
const RoleRedirect = () => {
  const navigate = useNavigate();
  const { data: profile, isError } = useProfile();

  useEffect(() => {
    // ProtectedRoute on /dashboard sorts out onboarding and other edge cases
    if (isError) {
      navigate("/dashboard", { replace: true });
      return;
    }
    if (!profile) return;

    if (profile.role === "unit") {
      navigate("/unit-dashboard", { replace: true });
    } else if (profile.role === "mentor") {
      navigate("/mentor-dashboard", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  }, [profile, isError, navigate]);

  return <Spinner />;
};

const JobBoardLanding = () => {
  const { data: session, isPending } = useSession();

  if (isPending) return <Spinner />;
  if (session) return <RoleRedirect />;
  return <PublicJobBoard />;
};

const Landing = () => {
  if (env.VITE_PUBLIC_JOB_BOARD) {
    return <JobBoardLanding />;
  }

  const isProduction = env.VITE_STAGE_TYPE === "production";

  if (isProduction) {
    // Redirecting to an external URL
    window.location.href = "https://yuvanext.com";
    return null;
  }

  // For development or staging, redirect using React Router
  return <Navigate to="/auth/candidate/signin" />;
};

export default Landing;
