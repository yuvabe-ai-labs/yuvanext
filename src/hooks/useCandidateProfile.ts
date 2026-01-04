import { useState, useEffect, useCallback } from "react";
import axiosInstance from "@/config/platform-api";

// Interfaces (replacing Supabase types)
export interface Application {
  id: string;
  internship_id: string;
  student_id: string;
  status: string;
  applied_date: string;
  [key: string]: any;
}

export interface Internship {
  id: string;
  title: string;
  description: string | null;
  [key: string]: any;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  [key: string]: any;
}

export interface StudentProfile {
  id: string;
  profile_id: string;
  skills: string[] | null;
  [key: string]: any;
}

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
    if (!applicationId) return;

    try {
      setLoading(true);
      setError(null);

      // Assumption: GET /api/applications/{id} or /api/applications?application_id={id}
      // Backend should return application with nested internship, profile, and studentProfile
      // Run requests in parallel
      const responseData = await Promise.all([
        axiosInstance.get("/unit/applications"),
      ]);
      // const { data: responseData } = await axiosInstance.get(
      `unit/applications`;
      // const { data: responseData } = await axiosInstance.get(
      //   `/applications/${applicationId}`
      // );
      console.log("%%%%%%%%%%%%%%%");
      console.log(responseData);

      // Expected response structure:
      // { application, internship, profile, studentProfile }
      // or { data: { application, internship, profile, studentProfile } }
      const candidateData = responseData?.data.data || responseData;

      if (!candidateData?.application) {
        setError("Application not found");
        return;
      }

      setData(candidateData as CandidateData);
    } catch (err: any) {
      console.error("Error fetching candidate data:", err);
      setError(err.message || "Failed to fetch candidate data");
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
