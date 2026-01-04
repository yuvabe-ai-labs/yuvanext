import axiosInstance from "@/config/platform-api";
import { useQuery } from "@tanstack/react-query";

export const getApplicationsStatusCard = async () => {
  // GET /api/applications
  // Backend should return applications with nested internship and unit data
  const { data } = await axiosInstance.get("/applications");
  return { data: { applications: Array.isArray(data) ? data : data.applications || [] }, error: null };
};

// react query
export const useApplicationsStatusCard = () => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["ApplicationStatus"],
    queryFn: getApplicationsStatusCard,
  });
  return {
    applications: data?.data?.applications || null,
    loading: isLoading,
    error,
  };
};
