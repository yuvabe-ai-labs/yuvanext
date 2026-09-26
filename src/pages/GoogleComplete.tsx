import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { authClient } from "@/lib/auth-client";
import signinLogo from "@/assets/YuvaNext.svg";
import { getProfile } from "@/services/profile.service";
import {
  completeSocialSignup,
  type SocialSignupRole,
} from "@/services/auth.service";

const VALID_ROLES: SocialSignupRole[] = ["candidate", "unit", "mentor"];

const ROLE_LABELS: Record<SocialSignupRole, string> = {
  candidate: "Candidate",
  unit: "Unit",
  mentor: "Mentor",
};

const isValidRole = (value: string | null): value is SocialSignupRole =>
  VALID_ROLES.includes(value as SocialSignupRole);

const dashboardFor = (role?: string) => {
  if (role === "unit") return "/unit-dashboard";
  if (role === "mentor") return "/mentor-dashboard";
  return "/dashboard";
};

interface CompanyDetails {
  companyName?: string;
  companyWebsite?: string;
}

/**
 * Where every Google sign-in lands.
 *
 * OAuth needs its return URL before the round-trip starts, which is before
 * anyone knows who the user is. So the button can't route by role — the role on
 * the sign-in page is only the one the user clicked from, not the one they have.
 * This screen reads the real profile after the fact and routes on that, the same
 * way the email path reads authData.user.role in SignIn.tsx.
 */
const GoogleComplete = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const roleParam = params.get("role");
  // Never guess the role. Someone who abandoned signup and came back later
  // arrives with no param, and defaulting would silently turn an intending
  // unit or mentor into a candidate, permanently and unnoticed.
  const trustedRole = isValidRole(roleParam) ? roleParam : null;
  const companyNameParam = params.get("companyName")?.trim() || "";
  const companyWebsiteParam = params.get("companyWebsite")?.trim() || "";

  const [needsRole, setNeedsRole] = useState(false);
  const [pendingRole, setPendingRole] = useState<SocialSignupRole | null>(null);
  const [companyNameInput, setCompanyNameInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const hasRun = useRef(false); // StrictMode mounts effects twice

  const failTo = useCallback(
    (message: string, role: string) => {
      toast({
        title: "Setup failed",
        description: message,
        variant: "destructive",
      });
      navigate(`/auth/${role}/signin?error=setup`, { replace: true });
    },
    [navigate, toast],
  );

  const submit = useCallback(
    async (role: SocialSignupRole, company?: CompanyDetails) => {
      setSubmitting(true);

      try {
        await completeSocialSignup({
          role,
          companyName: company?.companyName || undefined,
          companyWebsite: company?.companyWebsite || undefined,
        });
        // Load the fresh profile before routing, or ProtectedRoute reads stale
        // data and bounces the user straight back here.
        await queryClient.refetchQueries();
        navigate("/chatbot", { replace: true });
      } catch (error) {
        failTo(
          error instanceof Error
            ? error.message
            : "We couldn't finish setting up your account.",
          role,
        );
      }
    },
    [navigate, queryClient, failTo],
  );

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    (async () => {
      try {
        // fetchQuery also seeds the ["profile"] cache that useProfile reads,
        // so ProtectedRoute sees fresh data on the very next render.
        const profile = await queryClient.fetchQuery({
          queryKey: ["profile"],
          queryFn: getProfile,
        });

        // A leftJoin against a missing profile row reports null — strictly
        // null, never false. That is the unfinished social signup.
        const needsProfile = profile?.onboardingCompleted === null;

        if (!needsProfile && profile?.role) {
          const actualRole = String(profile.role).toLowerCase();

          // Same guard the email path applies in SignIn.tsx: signing in from
          // one role's page with a different account type is refused. Only
          // enforced when the page told us a role to check against.
          if (trustedRole && actualRole !== trustedRole) {
            await authClient.signOut();
            queryClient.clear();
            toast({
              title: "Access Denied",
              description:
                "You are trying to log in with a different account type.",
              variant: "destructive",
            });
            navigate(`/auth/${trustedRole}/signin`, { replace: true });
            return;
          }

          // Returning user. Route on the role they actually have.
          navigate(
            profile.onboardingCompleted === false
              ? "/chatbot"
              : dashboardFor(actualRole),
            { replace: true },
          );
          return;
        }

        // A unit needs a company name, or getProfile would fall back to showing
        // the person's Google account name as the unit's name.
        const unitMissingName = trustedRole === "unit" && !companyNameParam;

        if (trustedRole && !unitMissingName) {
          await submit(trustedRole, {
            companyName: companyNameParam,
            companyWebsite: companyWebsiteParam,
          });
          return;
        }

        // No profile row and nothing trustworthy to act on: ask.
        if (unitMissingName) setPendingRole("unit");
        setNeedsRole(true);
      } catch (error) {
        failTo(
          error instanceof Error
            ? error.message
            : "We couldn't load your account.",
          trustedRole ?? "candidate",
        );
      }
    })();
  }, [
    trustedRole,
    companyNameParam,
    companyWebsiteParam,
    submit,
    navigate,
    queryClient,
    failTo,
    toast,
  ]);

  const chooseRole = (role: SocialSignupRole) => {
    // Units need one more detail before we can create their profile.
    if (role === "unit") {
      setPendingRole("unit");
      return;
    }
    submit(role);
  };

  if (!needsRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-[#76A9FA] border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-[18px] font-medium" style={{ color: "#1F2A37" }}>
            Setting up your account...
          </div>
          <div className="text-[14px]" style={{ color: "#9CA3AF" }}>
            This will only take a moment
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-[420px] text-center">
        <img
          src={signinLogo}
          alt="YuvaNext"
          className="w-32 h-auto mx-auto mb-8"
        />

        <h1
          className="text-[24px] font-bold leading-[35px] mb-2"
          style={{ color: "#1F2A37" }}
        >
          Almost there
        </h1>

        {pendingRole === "unit" ? (
          <>
            <p className="text-[14px] mb-8" style={{ color: "#9CA3AF" }}>
              What's your company name? We use this instead of your Google
              account name.
            </p>

            <div className="border rounded-lg h-8 px-4 py-4 flex items-center border-[#D1D5DB] mb-4">
              <input
                id="companyName"
                type="text"
                autoFocus
                placeholder="Enter company name"
                value={companyNameInput}
                onChange={(e) => setCompanyNameInput(e.target.value)}
                disabled={submitting}
                className="w-full text-[13px] outline-none bg-transparent placeholder-[#9CA3AF]"
              />
            </div>

            <button
              type="button"
              onClick={() =>
                submit("unit", { companyName: companyNameInput.trim() })
              }
              disabled={submitting || !companyNameInput.trim()}
              className="w-full h-[35px] rounded-lg flex items-center justify-center text-[14px] font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "#76A9FA" }}
            >
              {submitting ? "Setting up..." : "Continue"}
            </button>
          </>
        ) : (
          <>
            <p className="text-[14px] mb-8" style={{ color: "#9CA3AF" }}>
              Tell us how you're joining YuvaNext so we can finish setting up
              your account.
            </p>

            <div className="space-y-3">
              {VALID_ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => chooseRole(role)}
                  disabled={submitting}
                  className="w-full h-[44px] rounded-lg border border-[#D1D5DB] text-[14px] font-medium transition-colors hover:bg-gray-50 disabled:opacity-50"
                  style={{ color: "#1F2A37" }}
                >
                  I'm joining as a {ROLE_LABELS[role]}
                </button>
              ))}
            </div>
          </>
        )}

        {submitting && pendingRole !== "unit" && (
          <p className="text-[13px] mt-6" style={{ color: "#9CA3AF" }}>
            Setting up your account...
          </p>
        )}
      </div>
    </div>
  );
};

export default GoogleComplete;
