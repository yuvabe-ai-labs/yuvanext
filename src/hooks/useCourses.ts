import { useQuery } from "@tanstack/react-query";
import { getCourses } from "@/services/courses.service";

export const useCourses = () => {
  return useQuery({
    queryKey: ["courses"],
    queryFn: getCourses,
  });
};
