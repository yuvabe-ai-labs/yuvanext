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
import { useSession } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import Landing from "./pages/Landing";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
// import UnitDashboard from "./pages/UnitDashboard";
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
import CheckEmail from "./components/CheckEmail";
import ResetPassword from "./pages/ResetPassword";
import CandidateTasks from "./pages/CandidateTasks";
import MyTasks from "./pages/MyTasks";
import UnitCandidateTasks from "./pages/UnitCandidateTasks";
import Settings from "./pages/Settings";
import ScrollToTop from "@/components/ScrollToTop";
import { NuqsAdapter } from "nuqs/adapters/react-router";
import { useProfile } from "@/hooks/useProfile";

const queryClient = new QueryClient();

// Protected Route component - redirects to chatbot by default
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // 2. CHECK SESSION STATUS
  const { data: session, isPending: isAuthPending } = useSession();

  if (isAuthPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-muted flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, redirect to Landing
  return session ? <>{children}</> : <Navigate to="/" replace />;
};

// Auth redirect component - redirects authenticated users to chatbot
const AuthRedirect = ({ children }: { children: React.ReactNode }) => {
  const { data: session, isPending: isAuthPending } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthPending && session) {
      // Redirect authenticated users to chatbot
      navigate("/chatbot", { replace: true });
    }
  }, [session, isAuthPending, navigate]);

  if (isAuthPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-muted flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If authenticated, will redirect via useEffect
  // If not authenticated, show the auth page
  return !session ? <>{children}</> : null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        {/* 4. REMOVED AuthProvider (Better Auth manages its own state) */}
        <NuqsAdapter>
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
            <Route
              path="/auth/:role/signin"
              element={
                <AuthRedirect>
                  <SignIn />
                </AuthRedirect>
              }
            />
            <Route
              path="/auth/:role/signup"
              element={
                <AuthRedirect>
                  <SignUp />
                </AuthRedirect>
              }
            />
            <Route path="/forgot-password" element={<ForgotPassword />} />
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
            {/* <Route
              path="/unit-dashboard"
              element={
                <ProtectedRoute>
                  <UnitDashboard />
                </ProtectedRoute>
              }
            /> */}
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
        </NuqsAdapter>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
