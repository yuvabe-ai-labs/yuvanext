// import { supabase } from "@/integrations/supabase/client";
// import type {
//   StudentTask,
//   CreateTaskInput,
//   UpdateTaskInput,
//   StudentTasksResponse,
// } from "@/types/studentTasks.types";

// export const getStudentTasks = async (
//   applicationId: string
// ): Promise<StudentTasksResponse> => {
//   try {
//     const { data, error } = await supabase
//       .from("student_tasks")
//       .select("*")
//       .eq("application_id", applicationId)
//       .order("start_date", { ascending: true });

//     if (error) {
//       console.error("Error fetching student tasks:", error);
//       return { data: [], error };
//     }

//     return {
//       data: data as StudentTask[],
//       error: null,
//     };
//   } catch (err: any) {
//     console.error("Unhandled error fetching student tasks:", err);
//     return { data: [], error: err.message || err };
//   }
// };

// export const createStudentTask = async (
//   userId: string,
//   taskData: CreateTaskInput
// ): Promise<{ success: boolean; data?: StudentTask; error?: any }> => {
//   try {
//     // 1️⃣ Fetch profile.id based on auth.user.id
//     const { data: profile, error: profileError } = await supabase
//       .from("profiles")
//       .select("id")
//       .eq("user_id", userId)
//       .single();

//     if (profileError || !profile) {
//       console.error("Profile not found for user:", userId, profileError);
//       return { success: false, error: profileError || "Profile not found" };
//     }

//     const profileId = profile.id;

//     // 2️⃣ Insert student task using profiles.id
//     const { data, error } = await supabase
//       .from("student_tasks")
//       .insert({
//         student_id: profileId,
//         application_id: taskData.application_id,
//         title: taskData.title,
//         description: taskData.description,
//         start_date: taskData.start_date,
//         start_time: taskData.start_time,
//         end_date: taskData.end_date,
//         end_time: taskData.end_time,
//         color: taskData.color || "#3B82F6",
//         submission_link: taskData.submission_link,
//         status: "pending",
//       })
//       .select()
//       .single();

//     if (error) {
//       console.error("Error creating student task:", error);
//       return { success: false, error };
//     }

//     return { success: true, data: data as StudentTask };
//   } catch (err: any) {
//     console.error("Unhandled error creating student task:", err);
//     return { success: false, error: err.message || err };
//   }
// };

// export const updateStudentTask = async (
//   taskId: string,
//   updates: UpdateTaskInput
// ): Promise<{ success: boolean; data?: StudentTask; error?: any }> => {
//   try {
//     const updateData: any = {
//       ...updates,
//       updated_at: new Date().toISOString(),
//     };

//     if (updates.status === "accepted" || updates.status === "redo") {
//       updateData.reviewed_at = new Date().toISOString();
//     }

//     const { data, error } = await supabase
//       .from("student_tasks")
//       .update(updateData)
//       .eq("id", taskId)
//       .select()
//       .single();

//     if (error) {
//       console.error("Error updating student task:", error);
//       return { success: false, error };
//     }

//     return { success: true, data: data as StudentTask };
//   } catch (err: any) {
//     console.error("Unhandled error updating student task:", err);
//     return { success: false, error: err.message || err };
//   }
// };

// export const deleteStudentTask = async (
//   taskId: string
// ): Promise<{ success: boolean; error?: any }> => {
//   try {
//     const { error } = await supabase
//       .from("student_tasks")
//       .delete()
//       .eq("id", taskId);

//     if (error) {
//       console.error("Error deleting student task:", error);
//       return { success: false, error };
//     }

import axiosInstance from "@/config/platform-api";
import { handleApiError } from "@/lib/api-handler";
import type {
  StudentTaskDTO,
  CandidateTasksData,
  StudentTask,
} from "@/types/studentTasks.types";

export const getStudentTasksByApplication = async (
  applicationId: string
): Promise<CandidateTasksData> => {
  try {
    const response = await axiosInstance.get(
      `/tasks/application/${applicationId}`
    );
    const rawData: StudentTaskDTO[] = response.data?.data || [];

    // Map API DTO (CamelCase) -> UI Interface (snake_case)
    const tasks: StudentTask[] = rawData.map((item) => ({
      id: item.taskId,
      application_id: item.applicationId,
      student_id: item.applicantId,
      title: item.taskTitle,
      description: item.taskDescription || "",
      start_date: item.taskStartDate || new Date().toISOString(),
      start_time: item.taskStartTime || "09:00",
      end_date: item.taskEndDate || new Date().toISOString(),
      end_time: item.taskEndTime || "17:00",
      color: "#3b82f6", // Default color
      submission_link: item.taskSubmissionLink || "",
      status: item.taskStatus,
      submitted_at: item.taskSubmittedAt || "",
      reviewed_by: "", // Not provided in this DTO
      review_remarks: item.taskReviewRemarks || "",
      reviewed_at: item.taskReviewedAt || "",
      created_at: new Date().toISOString(), // Mock if missing
      updated_at: new Date().toISOString(), // Mock if missing
    }));

    // Extract Info from first item
    const firstItem = rawData[0] || {};

    const candidate = {
      name: firstItem.applicantName || "Unknown Candidate",
      email: firstItem.applicantEmail || "",
      phone: firstItem.candidatePhoneNumber || "",
      avatarUrl: firstItem.candidateAvatarUrl || null,
    };

    const internship = {
      title: firstItem.internshipName || "Internship",
    };

    return { tasks, candidate, internship };
  } catch (error) {
    // Return safe default on error
    console.error("Task fetch error:", error);
    return {
      tasks: [],
      candidate: { name: "", email: "", phone: "", avatarUrl: null },
      internship: { title: "" },
    };
  }
};

//     return { success: true };
//   } catch (err: any) {
//     console.error("Unhandled error deleting student task:", err);
//     return { success: false, error: err.message || err };
//   }
// };
