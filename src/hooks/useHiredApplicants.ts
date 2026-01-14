import { useQuery } from "@tanstack/react-query";
import { getHiredApplicants } from "@/services/hired.service";
import { getProfile } from "@/services/profile.service";

// Hook 1: Get Profile Info (Unit Name/Avatar)
export const useUnitProfile = () => {
  return useQuery({
    queryKey: ["unitProfile"],
    queryFn: getProfile,
    // Optional: Select only specific fields if you want to mimic the old state exactly
    select: (data) => ({
      unit_name: data.name || "Unit",
      avatar_url: data.avatarUrl || data.image,
    }),
  });
};

export const useHiredApplicants = () => {
  return useQuery({
    queryKey: ["hiredApplicants"], // Unique key for this specific data
    queryFn: getHiredApplicants,
    // No select/filter needed anymore because the endpoint returns exactly what we need
  });
};
