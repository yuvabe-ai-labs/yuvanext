import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
// 1. IMPORT BETTER AUTH CLIENT
import { authClient } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import Landing from "./pages/Landing";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import UnitDashboard from "./pages/UnitDashboard";
import Chatbot from "./pages/Chatbot";
import Internships from "./pages/Internships";
import Courses from "./pages/Courses";
import Units from "./pages/Units";
import UnitView from "./pages/UnitView";
import CandidateProfile from "./pages/CandidateProfile";
import Profile from "./pages/Profile";
import AllApplications from "./pages/AllApplications";
import InternshipApplicants from "./pages/InternshipApplicants";
import NotFound from "./pages/NotFound";
import UnitProfile from "@/pages/UnitProfile";
import InternshipDetail from "./pages/InternshipDetail";
import AuthCallback from "@/hooks/AuthCallback";
import RecommendedInternships from "./pages/RecommendedInternships";
import ForgotPassword from "./pages/ForgotPassword";
import CheckEmail from "./pages/CheckEmail";
import ResetPassword from "./pages/ResetPassword";
import CandidateTasks from "./pages/CandidateTasks";
import MyTasks from "./pages/MyTasks";
import UnitCandidateTasks from "./pages/UnitCandidateTasks";
import Settings from "./pages/Settings";
import ScrollToTop from "@/components/ScrollToTop";

const queryClient = new QueryClient();

// Protected Route component with role-based routing (onboarding redirect removed)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // 2. CHECK SESSION STATUS
  const { data: session, isPending: isAuthPending } = authClient.useSession();

  const [profileLoading, setProfileLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkProfileAndRedirect = async () => {
      // If auth is still loading, do nothing yet
      if (isAuthPending) return;

      // If no session, the render will handle the redirect to "/"
      if (!session) {
        setProfileLoading(false);
        return;
      }

      try {
        // 3. FETCH PROFILE DATA FROM YOUR BACKEND (Hono)
        const response = await fetch("http://localhost:9999/api/profile", {
          headers: {
            "Content-Type": "application/json",
          },
          // CRITICAL: Send cookies to backend so it knows who we are
          credentials: "include",
        });

        if (!response.ok) {
          console.error("Failed to fetch profile");
          setProfileLoading(false);
          return;
        }

        const profile = await response.json();
        const role = profile?.role;

        // Only handle role-based dashboard redirects
        if (role === "candidate" && location.pathname === "/unit-dashboard") {
          navigate("/dashboard", { replace: true });
        } else if (role === "unit" && location.pathname === "/dashboard") {
          navigate("/unit-dashboard", { replace: true });
        }
      } catch (error) {
        console.error("Error checking profile:", error);
      } finally {
        setProfileLoading(false);
      }
    };

    checkProfileAndRedirect();
  }, [session, isAuthPending, location.pathname, navigate]);

  if (isAuthPending || (session && profileLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-muted flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, redirect to Landing
  return session ? <>{children}</> : <Navigate to="/" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        {/* 4. REMOVED AuthProvider (Better Auth manages its own state) */}
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />

          <Route
            path="/chatbot"
            element={
              <ProtectedRoute>
                <Chatbot />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Landing />} />
          <Route path="/auth/:role/signin" element={<SignIn />} />
          <Route path="/auth/:role/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/check-email" element={<CheckEmail />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            path="/internships/:id"
            element={
              <ProtectedRoute>
                <InternshipDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recommended-internships"
            element={
              <ProtectedRoute>
                <RecommendedInternships />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/unit-dashboard"
            element={
              <ProtectedRoute>
                <UnitDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/internships"
            element={
              <ProtectedRoute>
                <Internships />
              </ProtectedRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <Courses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/units"
            element={
              <ProtectedRoute>
                <Units />
              </ProtectedRoute>
            }
          />
          <Route
            path="/units/:id"
            element={
              <ProtectedRoute>
                <UnitView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate/:id"
            element={
              <ProtectedRoute>
                <CandidateProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/unit-profile"
            element={
              <ProtectedRoute>
                <UnitProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/all-applications"
            element={
              <ProtectedRoute>
                <AllApplications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/candidate-tasks"
            element={
              <ProtectedRoute>
                <CandidateTasks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/internship-applicants/:internshipId"
            element={
              <ProtectedRoute>
                <InternshipApplicants />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-tasks/:applicationId"
            element={
              <ProtectedRoute>
                <MyTasks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/unit/candidate-tasks/:applicationId"
            element={
              <ProtectedRoute>
                <UnitCandidateTasks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
