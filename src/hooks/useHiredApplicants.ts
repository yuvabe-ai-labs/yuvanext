import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useHiredApplicants = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [unitInfo, setUnitInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchApplicants = async () => {
      try {
        setLoading(true);
        setError(null);

        // STEP 1 ───── Fetch logged-in user's profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, full_name, role")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;
        if (!profile) throw new Error("Profile not found");

        // STEP 2 ───── Fetch unit info from units table
        const { data: unit, error: unitError } = await supabase
          .from("units")
          .select("unit_name, avatar_url")
          .eq("profile_id", profile.id)
          .maybeSingle();

        if (unitError) throw unitError;

        setUnitInfo(unit);

        // STEP 3 ───── Fetch all internships created by this unit
        const { data: internships, error: internshipError } = await supabase
          .from("internships")
          .select("id")
          .eq("created_by", profile.id);

        if (internshipError) throw internshipError;

        const internshipIds = internships.map((i) => i.id);
        if (internshipIds.length === 0) {
          setData([]);
          setLoading(false);
          return;
        }

        // STEP 4 ───── Fetch all hired applicants
        const { data: applications, error: appError } = await supabase
          .from("applications")
          .select(
            `
            id,
            status,
            offer_decision,
            internship:internship_id (
              id,
              title,
              description,
              duration,
              job_type
            ),
            student:student_id (
              id,
              full_name,
              student_profile:student_profiles (
                avatar_url
              )
            )
          `
          )
          .in("internship_id", internshipIds)
          .eq("status", "hired")
          .eq("offer_decision", "accepted");

        if (appError) throw appError;

        // STEP 5 ───── Normalize student avatar
        const formatted = applications.map((item: any) => ({
          application_id: item.id,
          status: item.status,
          offer_decision: item.offer_decision,

          internship: item.internship,

          student: {
            full_name: item.student.full_name,
            avatar_url:
              item.student.student_profile?.avatar_url ??
              item.student.avatar_url ??
              null,
          },
        }));

        setData(formatted);
      } catch (err: any) {
        console.error("Error fetching hired applicants:", err);
        setError(err.message || "Failed to fetch hired applicants");
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [user?.id]);

  return { data, unitInfo, loading, error };
};
