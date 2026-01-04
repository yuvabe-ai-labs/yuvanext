import { useState, useEffect } from "react";
import axiosInstance from "@/config/platform-api";
import { useSession } from "@/lib/auth-client"; // Better Auth session management

// Interview interface (replacing Supabase types)
export interface Interview {
  id: string;
  application_id: string;
  scheduled_date: string;
  meeting_link: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  unit_id: string;
  student_id: string;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  created_at: string;
  updated_at: string;
  application?: any;
  student?: any;
  unit?: any;
  [key: string]: any; // For additional fields
}

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
  const { data: session, isPending } = useSession(); // Better Auth session
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for auth to finish loading, then fetch if authenticated
    if (isPending) return;

    if (!session) {
      setLoading(false);
      return;
    }

    fetchInterviews();
  }, [session, isPending]);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setError(null);

      // Assumption: GET /api/interviews
      // Backend should filter by authenticated user's profile (unit or student)
      const { data } = await axiosInstance.get("/interviews");

      setInterviews(Array.isArray(data) ? data : data.interviews || []);
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

      // Assumption: POST /api/interviews
      const { data } = await axiosInstance.post("/interviews", {
        application_id: params.applicationId,
        scheduled_date: params.scheduledDate,
        meeting_link: params.meetingLink,
        title: params.title,
        description: params.description || "",
        duration_minutes: params.durationMinutes || 60,
        unit_id: params.unitId,
        student_id: params.studentId,
        status: "scheduled",
      });

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

      // Assumption: PUT /api/interviews/{id}
      const { data } = await axiosInstance.put(
        `/interviews/${params.id}`,
        updateData
      );

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

      // Assumption: DELETE /api/interviews/{id}
      await axiosInstance.delete(`/interviews/${id}`);

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

      // Assumption: GET /api/interviews?application_id={id}
      const { data } = await axiosInstance.get("/interviews", {
        params: { application_id: applicationId },
      });

      setInterviews(Array.isArray(data) ? data : data.interviews || []);
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
