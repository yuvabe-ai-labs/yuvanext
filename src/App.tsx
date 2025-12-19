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
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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

const queryClient = new QueryClient();

// Protected Route component with onboarding check and role-based routing
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const [profileLoading, setProfileLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkProfileAndRedirect = async () => {
      if (user) {
        try {
          // Fetch profile with role and onboarding status
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("onboarding_completed, role, deactivated_at")
            .eq("user_id", user.id)
            .maybeSingle();

          if (error) {
            console.error("Error fetching profile:", error);
            setProfileLoading(false);
            return;
          }

          // Direct Update if needed
          if (profile?.deactivated_at) {
            const { error: updateError } = await supabase
              .from("profiles")
              .update({ deactivated_at: null })
              .eq("user_id", user.id);

            if (updateError)
              console.error("Failed to reactivate:", updateError);
          }

          const isOnboardingCompleted = profile?.onboarding_completed || false;
          const role = profile?.role || "student";

          setHasCompletedOnboarding(isOnboardingCompleted);
          setUserRole(role);

          // If onboarding not completed, redirect to chatbot
          if (!isOnboardingCompleted && location.pathname !== "/chatbot") {
            navigate("/chatbot", { replace: true });
            setProfileLoading(false);
            return;
          }

          // Role-based routing after onboarding is complete
          if (isOnboardingCompleted) {
            // For students accessing unit dashboard or vice versa
            if (role === "student" && location.pathname === "/unit-dashboard") {
              navigate("/dashboard", { replace: true });
            } else if (role === "unit" && location.pathname === "/dashboard") {
              navigate("/unit-dashboard", { replace: true });
            }
            // Redirect from chatbot to appropriate dashboard after onboarding
            else if (location.pathname === "/chatbot") {
              const targetDashboard =
                role === "unit" ? "/unit-dashboard" : "/dashboard";
              navigate(targetDashboard, { replace: true });
            }
          }
        } catch (error) {
          console.error("Error checking profile:", error);
        }
      }
      setProfileLoading(false);
    };

    if (!loading && user) {
      checkProfileAndRedirect();
    } else {
      setProfileLoading(false);
    }
  }, [user, loading, location.pathname, navigate]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-muted flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth/callback" element={<AuthCallback />} />
            {/* Chatbot Route */}
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
              path="/chatbot"
              element={
                <ProtectedRoute>
                  <Chatbot />
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
            {/* <Route
              path="/candidate"
              element={
                <ProtectedRoute>
                  <CandidateProfile />
                </ProtectedRoute>
              }
            /> */}
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
