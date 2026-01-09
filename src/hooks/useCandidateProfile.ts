// import { useState, useEffect, useCallback } from "react";
// import axiosInstance from "@/config/platform-api";

// // Interfaces (replacing Supabase types)
// export interface Application {
//   id: string;
//   internship_id: string;
//   student_id: string;
//   status: string;
//   applied_date: string;
//   [key: string]: any;
// }

// export interface Internship {
//   id: string;
//   title: string;
//   description: string | null;
//   [key: string]: any;
// }

// export interface Profile {
//   id: string;
//   full_name: string;
//   email: string;
//   [key: string]: any;
// }

// export interface StudentProfile {
//   id: string;
//   profile_id: string;
//   skills: string[] | null;
//   [key: string]: any;
// }

// export interface CandidateData {
//   application: Application;
//   internship: Internship;
//   profile: Profile;
//   studentProfile: StudentProfile;
// }

// export const useCandidateProfile = (applicationId: string) => {
//   const [data, setData] = useState<CandidateData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchCandidateData = useCallback(async () => {
//     if (!applicationId) return;

//     try {
//       setLoading(true);
//       setError(null);

//       // Assumption: GET /api/applications/{id} or /api/applications?application_id={id}
//       // Backend should return application with nested internship, profile, and studentProfile
//       // Run requests in parallel
//       const responseData = await Promise.all([
//         axiosInstance.get("/unit/applications"),
//       ]);
//       // const { data: responseData } = await axiosInstance.get(
//       `unit/applications`;
//       // const { data: responseData } = await axiosInstance.get(
//       //   `/applications/${applicationId}`
//       // );
//       console.log("%%%%%%%%%%%%%%%");
//       console.log(responseData);

//       // Expected response structure:
//       // { application, internship, profile, studentProfile }
//       // or { data: { application, internship, profile, studentProfile } }
//       const candidateData = responseData?.data.data || responseData;

//       if (!candidateData?.application) {
//         setError("Application not found");
//         return;
//       }

//       setData(candidateData as CandidateData);
//     } catch (err: any) {
//       console.error("Error fetching candidate data:", err);
//       setError(err.message || "Failed to fetch candidate data");
//     } finally {
//       setLoading(false);
//     }
//   }, [applicationId]);

//   useEffect(() => {
//     if (applicationId) {
//       fetchCandidateData();
//     }
//   }, [applicationId, fetchCandidateData]);

//   return { data, loading, error, refetch: fetchCandidateData };
// };

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCandidateProfile,
  updateApplicationStatus,
} from "@/services/profile.service";
import { useToast } from "@/hooks/use-toast";
import type { UpdateApplicationStatusPayload } from "@/types/profile.types";

export const useCandidateProfile = (applicationId: string) => {
  return useQuery({
    queryKey: ["candidateProfile", applicationId],
    queryFn: () => getCandidateProfile(applicationId),
    enabled: !!applicationId,
    retry: 1,
  });
};

export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: UpdateApplicationStatusPayload) =>
      updateApplicationStatus(payload),
    onSuccess: (_, variables) => {
      const isInterview = variables.status === "interviewed";
      toast({
        title: isInterview ? "Interview Scheduled" : "Status Updated",
        description: isInterview
          ? "Interview scheduled and candidate notified."
          : "Application status updated successfully.",
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["candidateProfile"] }); // broad invalidation or specific ID
      queryClient.invalidateQueries({ queryKey: ["unitApplications"] });
    },
    onError: (error: any) => {
      console.error("Update status failed", error);
    },
  });
};
