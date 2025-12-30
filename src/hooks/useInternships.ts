import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Tables } from "@/integrations/supabase/types";
import type { DatabaseProfile } from "@/types/profile";

type Internship = Tables<"internships">;

export const useIntern = () => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("internships")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setInternships(data || []);
      } catch (error) {
        console.error("Error fetching internships:", error);
        setError("Failed to fetch internships");
      } finally {
        setLoading(false);
      }
    };

    fetchInternships();
  }, []);

  return { internships, loading, error };
};

export const useInternships = () => {
  const { user } = useAuth();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<DatabaseProfile | null>(null);

  useEffect(() => {
    const fetchProfileAndInternships = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // 1. First, fetch the user's profile to get the profile ID
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        if (!profileData) {
          setError("Profile not found");
          setLoading(false);
          return;
        }

        setProfile(profileData as unknown as DatabaseProfile);

        // 2. Fetch internships created by this profile with status 'active' or 'closed'
        const { data, error: internshipsError } = await supabase
          .from("internships")
          .select("*")
          .eq("created_by", profileData.id)
          .in("status", ["active", "closed"])
          .order("created_at", { ascending: false });

        if (internshipsError) throw internshipsError;

        setInternships(data || []);
      } catch (err: any) {
        console.error("Error fetching internships:", err);
        setError(err.message || "Failed to fetch internships");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndInternships();
  }, [user?.id]);

  // Optional: Add a refetch function for manual refresh
  const refetch = async () => {
    if (!user || !profile) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: internshipsError } = await supabase
        .from("internships")
        .select("*")
        .eq("created_by", profile.id)
        .in("status", ["active", "closed"])
        .order("created_at", { ascending: false });

      if (internshipsError) throw internshipsError;

      setInternships(data || []);
    } catch (err: any) {
      console.error("Error refetching internships:", err);
      setError(err.message || "Failed to refetch internships");
    } finally {
      setLoading(false);
    }
  };

  return {
    internships,
    loading,
    error,
    profile,
    refetch,
  };
};
