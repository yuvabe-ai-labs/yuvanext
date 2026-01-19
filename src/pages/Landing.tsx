import { Navigate } from "react-router-dom";
import { env } from "@/env";

const Landing = () => {
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
