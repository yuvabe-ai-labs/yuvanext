import axiosInstance from "@/config/platform-api";
import { handleApiResponse, handleApiError } from "@/lib/api-handler";

export type SocialSignupRole = "candidate" | "unit" | "mentor";

export interface CompleteSocialSignupResult {
  role: SocialSignupRole;
  alreadyCompleted: boolean;
}

export interface CompleteSocialSignupPayload {
  role: SocialSignupRole;
  // Required by the API when role is "unit" — without it the unit would be
  // named after the person's Google account.
  companyName?: string;
  companyWebsite?: string;
}

// Assigns the role a Google sign-up chose and creates its profile row.
// Google users never verify by email, so this is what triggers the step the
// email verification link normally triggers.
export const completeSocialSignup = async (
  payload: CompleteSocialSignupPayload,
): Promise<CompleteSocialSignupResult> => {
  try {
    const response = await axiosInstance.post(
      "/auth/complete-social-signup",
      payload,
    );
    return handleApiResponse<CompleteSocialSignupResult>(
      response,
      {} as CompleteSocialSignupResult,
    );
  } catch (error) {
    return handleApiError(error, "Failed to complete account setup");
  }
};
