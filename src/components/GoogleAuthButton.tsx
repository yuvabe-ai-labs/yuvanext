import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { env } from "@/env";
import { useToast } from "@/components/ui/use-toast";

// Google's branding guidelines require the official mark, so it is inlined here
// rather than approximated.
const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"
    />
    <path
      fill="#34A853"
      d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"
    />
    <path
      fill="#FBBC05"
      d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"
    />
    <path
      fill="#EA4335"
      d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"
    />
  </svg>
);

interface GoogleAuthButtonProps {
  role: string; // "candidate" | "unit" | "mentor", from the route param
  mode: "signin" | "signup";
  disabled?: boolean;
  /** Unit signups only. Becomes units.name so the unit isn't named after the
   *  person's Google account. */
  companyName?: string;
  companyWebsite?: string;
  /** Shown under the button, e.g. to explain why it is disabled. */
  hint?: string;
}

const GoogleAuthButton = ({
  role,
  mode,
  disabled,
  companyName,
  companyWebsite,
  hint,
}: GoogleAuthButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGoogle = async () => {
    setLoading(true);

    const FRONTEND = env.VITE_FRONTEND_URL;

    // Better Auth keeps callbackURL in its server-side state, so these values
    // are never handed to Google — they just come back to us afterwards.
    const returnParams = new URLSearchParams({ role });
    if (companyName?.trim()) {
      returnParams.set("companyName", companyName.trim());
    }
    if (companyWebsite?.trim()) {
      returnParams.set("companyWebsite", companyWebsite.trim());
    }

    const { error } = await authClient.signIn.social({
      provider: "google",
      // The provider sets disableImplicitSignUp, so only the signup pages may
      // create a new account. Signing in with an unknown Google account is
      // refused rather than silently registering it.
      requestSignUp: mode === "signup",
      // Both new and returning users land here. OAuth wants this URL before the
      // round-trip, which is before we know the user's real role, so the
      // completion screen reads the profile and routes from there. The role
      // below is only the one this page was opened as — it is used for a brand
      // new signup and ignored for anyone who already has a profile.
      callbackURL: `${FRONTEND}/auth/google/complete?${returnParams.toString()}`,
      // No ?error= of our own: Better Auth appends the real reason, and a
      // duplicate key would shadow it on the way out.
      errorCallbackURL: `${FRONTEND}/auth/${role}/${mode}`,
    });

    // On success the browser has already left for Google and nothing below runs.
    if (error) {
      toast({
        title: "Google sign-in unavailable",
        description: error.message || "Please try again or use your email.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 my-6">
        <div className="h-px flex-1 bg-[#E5E7EB]" />
        <span className="text-[12px]" style={{ color: "#9CA3AF" }}>
          or
        </span>
        <div className="h-px flex-1 bg-[#E5E7EB]" />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading || disabled}
        className="w-full h-[35px] rounded-lg border border-[#D1D5DB] flex items-center justify-center gap-2 text-[14px] font-medium transition-colors hover:bg-gray-50 disabled:opacity-50"
        style={{ color: "#1F2A37" }}
      >
        <GoogleIcon />
        {loading ? "Redirecting..." : "Continue with Google"}
      </button>

      {hint && (
        <p className="text-[12px] mt-2 text-center" style={{ color: "#9CA3AF" }}>
          {hint}
        </p>
      )}
    </>
  );
};

export default GoogleAuthButton;
