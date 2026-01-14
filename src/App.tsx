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
import { useSession } from "@/lib/auth-client";
import { useEffect } from "react";
import { NuqsAdapter } from "nuqs/adapters/react-router";
import Landing from "./pages/Landing";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import UnitDashboard from "./pages/UnitDashboard";
// import Chatbot from "./pages/Chatbot";
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
import RecommendedInternships from "./pages/RecommendedInternships";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CandidateTasks from "./pages/CandidateTasks";
import MyTasks from "./pages/MyTasks";
import UnitCandidateTasks from "./pages/UnitCandidateTasks";
import Settings from "./pages/Settings";
import AuthCallback from "@/hooks/AuthCallback";
import ScrollToTop from "@/components/ScrollToTop";
import { useProfile } from "@/hooks/useProfile";

const queryClient = new QueryClient();
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { data: session, isPending: isAuthPending } = useSession();
  const { data: profile, isLoading: isProfileLoading } = useProfile();

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 1. Wait for Auth and Profile to load
    if (isAuthPending || isProfileLoading) return;

    // 2. If no session, the render return below handles the redirect to "/"
    if (!session) return;

    // 3. Role-Based Redirects
    // Ensure profile exists before checking role
    if (profile) {
      const role = profile.role;
      const path = location.pathname;

      // Candidate trying to access Unit Dashboard
      if (role === "candidate" && path.startsWith("/unit-dashboard")) {
        navigate("/dashboard", { replace: true });
      }

      // Unit trying to access Candidate Dashboard
      if (role === "unit" && path === "/dashboard") {
        navigate("/unit-dashboard", { replace: true });
      }
    }
  }, [
    session,
    isAuthPending,
    profile,
    isProfileLoading,
    location.pathname,
    navigate,
  ]);

  // Show loading spinner while Auth or Profile is fetching
  if (isAuthPending || (session && isProfileLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-muted flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If validated session exists, render children. Otherwise, redirect to Landing.
  return session ? <>{children}</> : <Navigate to="/" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <NuqsAdapter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/auth/:role/signin" element={<SignIn />} />
            <Route path="/auth/:role/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Routes */}
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
            {/* Dashboards */}
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
            {/* Common Resources */}
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
            {/* Profiles */}
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
            {/* Candidate Views */}
            <Route
              path="/candidate/:id"
              element={
                <ProtectedRoute>
                  <CandidateProfile />
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
              path="/my-tasks/:applicationId"
              element={
                <ProtectedRoute>
                  <MyTasks />
                </ProtectedRoute>
              }
            />

            {/* Unit Management Views */}
            <Route
              path="/all-applications"
              element={
                <ProtectedRoute>
                  <AllApplications />
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
              path="/unit/candidate-tasks/:applicationId"
              element={
                <ProtectedRoute>
                  <UnitCandidateTasks />
                </ProtectedRoute>
              }
            />
            {/* Settings & Misc */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            {/* <Route
              path="/chatbot"
              element={
                <ProtectedRoute>
                  <Chatbot />
                </ProtectedRoute>
              }
            /> 
            */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </NuqsAdapter>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
