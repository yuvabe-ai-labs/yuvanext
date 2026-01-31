import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { env } from "@/env";

interface AuthShape {
  user: {
    additionalFields: {
      role: { type: "string"; required: true };
    };
  };
}

export const authClient = createAuthClient({
  baseURL: env.VITE_API_URL,
  plugins: [inferAdditionalFields<AuthShape>()],
});

export const { useSession, signIn, signUp, signOut } = authClient;
