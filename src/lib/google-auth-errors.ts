/**
 * Better Auth redirects a failed OAuth round-trip to errorCallbackURL with an
 * ?error= code, and Google itself adds one when the user cancels. Without this
 * mapping those failures are silent — the user just lands back on the form.
 */
const MESSAGES: Record<string, string> = {
  // We turned them away: disableImplicitSignUp is on and this is a signin page.
  signup_disabled:
    "No YuvaNext account is linked to that Google account. Please sign up first.",
  access_denied: "You cancelled the Google sign-in.",
  account_not_linked:
    "An account with this email already exists. Sign in with your password, then link Google from settings.",
  unable_to_link_account:
    "We couldn't link that Google account. Please try again.",
  "email_doesn't_match":
    "That Google account uses a different email address than your account.",
  email_not_found:
    "Google didn't share an email address for that account, so we can't sign you in.",
};

const FALLBACK = "Google sign-in failed. Please try again or use your email.";

export const googleAuthErrorMessage = (code: string | null): string | null => {
  if (!code) return null;
  return MESSAGES[code] ?? FALLBACK;
};
