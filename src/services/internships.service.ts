import axiosInstance from "@/config/platform-api";
import type {
  Internship,
  SavedInternships,
  AppliedInternships,
  SavedAndAppliedCount,
  AppliedInternshipStatus,
  CandidateDecision,
  ApiMessageResponse,
  ApplyInternshipRequest,
} from "@/types/internships.types";
import { handleApiResponse, handleApiError } from "@/lib/api-handler";

// Get all internships

export const getInternships = async (): Promise<Internship[]> => {
  try {
    const response = await axiosInstance.get("/internships");
    return handleApiResponse<Internship[]>(response, []);
  } catch (error) {
    return handleApiError(error, "Failed to fetch internships");
  }
};

// Get internship by id

export const getInternshipById = async (id: string): Promise<Internship> => {
  try {
    const response = await axiosInstance.get(`/internships/${id}`);
    return handleApiResponse<Internship>(response, {} as Internship);
  } catch (error) {
    return handleApiError(error, `Failed to fetch internships ${id}`);
  }
};

// Get recommended internships

export const getRemommendedInternships = async (): Promise<Internship[]> => {
  try {
    const response = await axiosInstance.get("/internships/recommended");
    return handleApiResponse<Internship[]>(response, []);
  } catch (error) {
    return handleApiError(error, "Failed to fetch recommended internships");
  }
};

// export const getRemommendedInternships = async (): Promise<Internship[]> => {
//   try {
//     const response = await axiosInstance.get("/internships/recommended");

//     // Handle the nested structure: data.data.internships
//     const apiData = response.data;

//     // If the response has the expected structure
//     if (apiData?.data?.internships && Array.isArray(apiData.data.internships)) {
//       return apiData.data.internships;
//     }

//     // Fallback to handleApiResponse for other structures
//     return handleApiResponse<Internship[]>(response, []);
//   } catch (error) {
//     return handleApiError(error, "Failed to fetch recommended internships");
//   }
// };

// Get Saved internships

export const getSavedInternships = async (): Promise<SavedInternships[]> => {
  try {
    const response = await axiosInstance.get("/candidate/internship/save");
    return handleApiResponse<SavedInternships[]>(response, []);
  } catch (error) {
    return handleApiError(error, "Failed to fetch Saved internships");
  }
};

// Get Applied internships

export const getAppliedInternships = async (): Promise<
  AppliedInternships[]
> => {
  try {
    const response = await axiosInstance.get("/candidate/internship/apply");
    return handleApiResponse<AppliedInternships[]>(response, []);
  } catch (error) {
    return handleApiError(error, "Failed to fetch Applied internships");
  }
};

// Get Saved & and Applied Count

export const getSaveAndAppliedCount =
  async (): Promise<SavedAndAppliedCount> => {
    try {
      const response = await axiosInstance.get("/candidate/internship/counts");
      return handleApiResponse<SavedAndAppliedCount>(
        response,
        {} as SavedAndAppliedCount
      );
    } catch (error) {
      return handleApiError(error, "Failed to fetch internships count");
    }
  };

// Save internship
export const saveInternship = async (
  internshipId: string
): Promise<ApiMessageResponse> => {
  try {
    const response = await axiosInstance.post(
      `/candidate/internship/${internshipId}/save`
    );

    return handleApiResponse<ApiMessageResponse>(
      response,
      {} as ApiMessageResponse
    );
  } catch (error) {
    return handleApiError(error, "Failed to save internship");
  }
};

// Remove saved internship
export const removeSavedInternship = async (
  internshipId: string
): Promise<ApiMessageResponse> => {
  try {
    const response = await axiosInstance.delete(
      `/candidate/internship/${internshipId}/save`
    );

    return handleApiResponse<ApiMessageResponse>(
      response,
      {} as ApiMessageResponse
    );
  } catch (error) {
    return handleApiError(error, "Failed to remove saved internship");
  }
};

// Generate share link for internship
export const getInternshipShareLink = async (
  internshipId: string
): Promise<string> => {
  try {
    const response = await axiosInstance.get(
      `/candidate/internship/share/${internshipId}`
    );

    return handleApiResponse<string>(response, "");
  } catch (error) {
    return handleApiError(error, "Failed to generate share link");
  }
};

// Get applied internship status
export const getAppliedInternshipStatus =
  async (): Promise<AppliedInternshipStatus> => {
    try {
      const response = await axiosInstance.get(
        "/candidate/internship/application-status"
      );

      return handleApiResponse<AppliedInternshipStatus>(
        response,
        {} as AppliedInternshipStatus
      );
    } catch (error) {
      return handleApiError(error, "Failed to fetch applied internship status");
    }
  };

// Update candidate decision (accept / reject / pending)
export const updateCandidateDecision = async (
  applicationId: string,
  decision: CandidateDecision
): Promise<boolean> => {
  try {
    const response = await axiosInstance.post(
      `/candidate/internship/application/${applicationId}/accept-offer`,
      { decision }
    );

    return handleApiResponse<boolean>(response, false);
  } catch (error) {
    return handleApiError(error, "Failed to update candidate decision");
  }
};

// Apply to an internship
export const applyToInternship = async (
  internshipId: string,
  data: ApplyInternshipRequest
): Promise<ApplyInternshipRequest> => {
  try {
    const response = await axiosInstance.post(
      `/candidate/internship/${internshipId}/apply`,
      data
    );

    return handleApiResponse<ApplyInternshipRequest>(
      response,
      {} as ApplyInternshipRequest
    );
  } catch (error) {
    return handleApiError(error, "Failed to apply to internship");
  }
};
