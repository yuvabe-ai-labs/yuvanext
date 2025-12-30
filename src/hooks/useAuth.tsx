import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: string,
    websiteUrl?: string
  ) => Promise<{ error: any }>;
  signIn: (
    email: string,
    password: string,
    rememberMe?: boolean,
    expectedRole?: string
  ) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  signInWithOAuth: (provider: "google" | "apple") => Promise<{ error: any }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST - keep it synchronous
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle profile operations in a separate effect to avoid deadlock
  useEffect(() => {
    const handleProfileOperations = async () => {
      if (!user || !session) return;

      try {
        console.log("Checking profile for user:", user.id);

        // Check if profile exists
        const { data: existingProfile, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (fetchError) {
          console.error("Error fetching profile:", fetchError);
          toast({
            title: "Profile check failed",
            description: "There was an error checking your profile.",
            variant: "destructive",
          });
          return;
        }

        // If no profile exists, create one
        if (!existingProfile) {
          console.log("No profile found, creating profile...");

          const userData = user.user_metadata;
          const pendingRole = localStorage.getItem("pendingRole");
          const pendingWebsite = localStorage.getItem("pendingWebsite");
          const userRole = userData.role || pendingRole || "student";
          const fullName =
            userData.full_name ||
            userData.name ||
            user.email?.split("@")[0] ||
            "User";
          const email = user.email || "";
          const websiteUrl = userData.website_url || pendingWebsite || null;

          // Clear pending data
          if (pendingRole) {
            localStorage.removeItem("pendingRole");
          }
          if (pendingWebsite) {
            localStorage.removeItem("pendingWebsite");
          }

          const { data: newProfile, error: profileError } = await supabase
            .from("profiles")
            .insert({
              user_id: user.id,
              full_name: fullName,
              role: userRole,
              email: email,
              onboarding_completed: false,
            })
            .select()
            .single();

          if (profileError) {
            console.error("Profile creation failed:", profileError);
            toast({
              title: "Profile setup failed",
              description:
                "There was an error setting up your profile. Please contact support.",
              variant: "destructive",
            });
          } else {
            console.log("Profile created successfully:", newProfile);

            // Initialize role-specific table
            if (userRole === "student") {
              const { error: studentError } = await supabase
                .from("student_profiles")
                .insert({
                  profile_id: newProfile.id,
                });

              if (studentError) {
                console.error(
                  "Student profile initialization failed:",
                  studentError
                );
              } else {
                console.log("Student profile initialized successfully");
              }
            } else if (userRole === "unit") {
              const unitData: any = {
                profile_id: newProfile.id,
                unit_name: fullName, // Use signup name as company name
              };

              // Add website URL if provided
              if (websiteUrl) {
                unitData.website_url = websiteUrl;
              }

              const { error: unitError } = await supabase
                .from("units")
                .insert(unitData);

              if (unitError) {
                console.error("Unit profile initialization failed:", unitError);
              } else {
                console.log("Unit profile initialized successfully");
              }
            }

            toast({
              title: "Welcome!",
              description: "Your account has been set up successfully.",
            });
          }
        } else {
          console.log("Profile already exists:", existingProfile);
        }
      } catch (error) {
        console.error("Profile operation failed:", error);
      }
    };

    // Defer profile operations to avoid blocking auth state changes
    if (user && session) {
      const timeoutId = setTimeout(handleProfileOperations, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [user, session, toast]);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: string,
    websiteUrl?: string
  ) => {
    try {
      console.log("Starting signup process for:", email, "with role:", role);

      // Redirect to auth callback handler, which will then route to chatbot
      const redirectUrl = `${window.location.origin}/auth/callback`;

      const metadata: any = {
        full_name: fullName,
        role: role,
      };

      // Add website URL to metadata if provided (for unit role)
      if (websiteUrl) {
        metadata.website_url = websiteUrl;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: metadata,
        },
      });

      if (error) {
        console.error("Signup error:", error);
        return { error };
      }

      // Check if user already exists (Supabase returns data but user has identities already)
      if (
        data.user &&
        data.user.identities &&
        data.user.identities.length === 0
      ) {
        console.log("User already exists");
        return {
          error: {
            message: "User already registered. Please sign in instead.",
          },
        };
      }

      // Store role and website for use after email confirmation
      if (role) {
        localStorage.setItem("pendingRole", role);
      }
      if (websiteUrl) {
        localStorage.setItem("pendingWebsite", websiteUrl);
      }

      // Don't create profile immediately - will be created on first sign in
      console.log(
        "User signup initiated, profile will be created on email confirmation"
      );

      return { error: null };
    } catch (error: any) {
      console.error("Signup process failed:", error);
      return { error };
    }
  };

  const signIn = async (
    email: string,
    password: string,
    rememberMe: boolean = false,
    expectedRole?: string
  ) => {
    try {
      console.log("[useAuth] Signing in with rememberMe:", rememberMe);

      // Use secure-auth Edge Function for HttpOnly cookie auth
      const { data, error } = await supabase.functions.invoke("secure-auth", {
        body: {
          action: "signIn",
          email,
          password,
          rememberMe,
        },
      });

      if (error) {
        console.error("[useAuth] Sign in error:", error);
        return { error };
      }

      if (data.error) {
        console.error("[useAuth] Sign in error:", data.error);
        // Handle specific error for unconfirmed email
        if (data.error.includes("Email not confirmed")) {
          return {
            error: {
              message:
                "Please check your email and click the confirmation link before signing in.",
            },
          };
        }
        return { error: { message: data.error } };
      }

      // Set session in Supabase client
      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }

      // Role validation - check if expectedRole is provided
      if (expectedRole) {
        console.log("[useAuth] Validating role:", expectedRole);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Fetch the user's profile to check their role
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("user_id", user.id)
            .single();

          if (profileError) {
            console.error("[useAuth] Error fetching profile:", profileError);
            // Sign out on profile fetch error
            await supabase.auth.signOut();
            return {
              error: {
                message: "Unable to verify account role. Please try again.",
              },
            };
          }

          // Check if the profile role matches the expected role
          if (profile.role !== expectedRole) {
            console.log(
              "[useAuth] Role mismatch. Expected:",
              expectedRole,
              "Got:",
              profile.role
            );
            // Sign out the user
            await supabase.auth.signOut();
            return {
              error: {
                message: `This sign-in page is for ${expectedRole}s only. Please use the correct sign-in page for your account type.`,
              },
            };
          }

          console.log("[useAuth] Role validation passed");
        }
      }

      console.log("[useAuth] Sign in successful");
      return { error: null };
    } catch (error: any) {
      console.error("[useAuth] Sign in failed:", error);
      // Sign out on any error during role validation
      await supabase.auth.signOut();
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log("[useAuth] Signing out...");

      // Call secure-auth Edge Function to clear HttpOnly cookies
      await supabase.functions.invoke("secure-auth", {
        body: { action: "signOut" },
      });

      // Sign out from Supabase client
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("[useAuth] Sign out error:", error);
        toast({
          title: "Sign out failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        console.log("[useAuth] Sign out successful");
      }
    } catch (error: any) {
      console.error("[useAuth] Sign out failed:", error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  const signInWithOAuth = async (provider: "google" | "apple") => {
    try {
      // Store pending role for OAuth flow
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return { error };
    } catch (error: any) {
      console.error("OAuth sign in failed:", error);
      return { error };
    }
  };

  const value = {
    user,
    session,
    signUp,
    signIn,
    signOut,
    resetPassword,
    signInWithOAuth,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
