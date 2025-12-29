import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_BETTER_AUTH_URL, // Hono Backend URL
});

// Export the hook for easy access in components
export const { useSession, signIn, signUp, signOut } = authClient;
