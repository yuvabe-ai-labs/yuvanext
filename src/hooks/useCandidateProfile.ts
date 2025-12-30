import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Application = Tables<"applications">;
type Internship = Tables<"internships">;
type Profile = Tables<"profiles">;
type StudentProfile = Tables<"student_profiles">;

export interface CandidateData {
  application: Application;
  internship: Internship;
  profile: Profile;
  studentProfile: StudentProfile;
}

export const useCandidateProfile = (applicationId: string) => {
  const [data, setData] = useState<CandidateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCandidateData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch application details
      const { data: application, error: appError } = await supabase
        .from("applications")
        .select("*")
        .eq("id", applicationId)
        .single();

      if (appError) throw appError;
      if (!application) {
        setError("Application not found");
        return;
      }

      // Fetch internship details
      const { data: internship, error: internshipError } = await supabase
        .from("internships")
        .select("*")
        .eq("id", application.internship_id)
        .single();

      if (internshipError) throw internshipError;

      // Fetch student profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", application.student_id)
        .single();

      if (profileError) throw profileError;

      // Fetch student details
      const { data: studentProfile, error: studentProfileError } =
        await supabase
          .from("student_profiles")
          .select("*")
          .eq("profile_id", application.student_id)
          .single();

      if (studentProfileError) throw studentProfileError;

      setData({
        application,
        internship,
        profile,
        studentProfile,
      });
    } catch (error) {
      console.error("Error fetching candidate data:", error);
      setError("Failed to fetch candidate data");
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    if (applicationId) {
      fetchCandidateData();
    }
  }, [applicationId, fetchCandidateData]);

  return { data, loading, error, refetch: fetchCandidateData };
};
