import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Tables } from "@/integrations/supabase/types";

type Interview = Tables<"interviews">;

interface CreateInterviewParams {
  applicationId: string;
  scheduledDate: string;
  meetingLink: string;
  title: string;
  description?: string;
  durationMinutes?: number;
  unitId: string;
  studentId: string;
}

interface UpdateInterviewParams {
  id: string;
  scheduledDate?: string;
  meetingLink?: string;
  title?: string;
  description?: string;
  durationMinutes?: number;
  status?: "scheduled" | "completed" | "cancelled" | "no_show";
}

export const useInterviews = () => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchInterviews();
  }, [user?.id]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch profile first to get profile ID
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user?.id)
        .single();

      if (profileError) throw profileError;

      // Fetch interviews where user is either unit (sender) or student (receiver)
      const { data, error: interviewsError } = await supabase
        .from("interviews")
        .select(
          `
          *,
          application:applications (
            *,
            internship:internships (
              title,
              company_name
            )
          ),
          student:student_id (
            full_name,
            email
          ),
          unit:unit_id (
            full_name,
            email
          )
        `
        )
        .or(`unit_id.eq.${profileData.id},student_id.eq.${profileData.id}`)
        .order("scheduled_date", { ascending: true });

      if (interviewsError) throw interviewsError;

      setInterviews(data || []);
    } catch (err: any) {
      console.error("Error fetching interviews:", err);
      setError(err.message || "Failed to fetch interviews");
    } finally {
      setLoading(false);
    }
  };

  const createInterview = async (params: CreateInterviewParams) => {
    try {
      setError(null);

      const { data, error: insertError } = await supabase
        .from("interviews")
        .insert({
          application_id: params.applicationId,
          scheduled_date: params.scheduledDate,
          meeting_link: params.meetingLink,
          title: params.title,
          description: params.description || "",
          duration_minutes: params.durationMinutes || 60,
          unit_id: params.unitId,
          student_id: params.studentId,
          status: "scheduled",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Refresh interviews list
      await fetchInterviews();

      return { data, error: null };
    } catch (err: any) {
      console.error("Error creating interview:", err);
      setError(err.message || "Failed to create interview");
      return { data: null, error: err.message };
    }
  };

  const updateInterview = async (params: UpdateInterviewParams) => {
    try {
      setError(null);

      const updateData: any = {};
      if (params.scheduledDate)
        updateData.scheduled_date = params.scheduledDate;
      if (params.meetingLink) updateData.meeting_link = params.meetingLink;
      if (params.title) updateData.title = params.title;
      if (params.description !== undefined)
        updateData.description = params.description;
      if (params.durationMinutes)
        updateData.duration_minutes = params.durationMinutes;
      if (params.status) updateData.status = params.status;

      const { data, error: updateError } = await supabase
        .from("interviews")
        .update(updateData)
        .eq("id", params.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Refresh interviews list
      await fetchInterviews();

      return { data, error: null };
    } catch (err: any) {
      console.error("Error updating interview:", err);
      setError(err.message || "Failed to update interview");
      return { data: null, error: err.message };
    }
  };

  const deleteInterview = async (id: string) => {
    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from("interviews")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      // Refresh interviews list
      await fetchInterviews();

      return { error: null };
    } catch (err: any) {
      console.error("Error deleting interview:", err);
      setError(err.message || "Failed to delete interview");
      return { error: err.message };
    }
  };

  const cancelInterview = async (id: string) => {
    return updateInterview({ id, status: "cancelled" });
  };

  const completeInterview = async (id: string) => {
    return updateInterview({ id, status: "completed" });
  };

  const markAsNoShow = async (id: string) => {
    return updateInterview({ id, status: "no_show" });
  };

  return {
    interviews,
    loading,
    error,
    fetchInterviews,
    createInterview,
    updateInterview,
    deleteInterview,
    cancelInterview,
    completeInterview,
    markAsNoShow,
  };
};

// Hook for getting interviews for a specific application
export const useApplicationInterviews = (applicationId: string | null) => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!applicationId) {
      setLoading(false);
      return;
    }

    fetchApplicationInterviews();
  }, [applicationId]);

  const fetchApplicationInterviews = async () => {
    if (!applicationId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: interviewsError } = await supabase
        .from("interviews")
        .select(
          `
          *,
          student:student_id (
            full_name,
            email
          ),
          unit:unit_id (
            full_name,
            email
          )
        `
        )
        .eq("application_id", applicationId)
        .order("scheduled_date", { ascending: true });

      if (interviewsError) throw interviewsError;

      setInterviews(data || []);
    } catch (err: any) {
      console.error("Error fetching application interviews:", err);
      setError(err.message || "Failed to fetch interviews");
    } finally {
      setLoading(false);
    }
  };

  return {
    interviews,
    loading,
    error,
    refetch: fetchApplicationInterviews,
  };
};
