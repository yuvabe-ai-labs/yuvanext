import { supabase } from "@/integrations/supabase/client";
import Internship from "@/pages/Internships";
// import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

export const getApplicationsStatusCard = async (userId: string) => {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (profileError || !profile) return { data: null, error: profileError };
  const { data: applications, error } = await supabase
    .from("applications")
    .select(
      `
    id,
    status,
    applied_date,
    offer_decision,
    
    internships:internship_id ( 
      id,
      title,
      
      profiles:created_by ( 
        id, 
        
        units ( 
          id,
          unit_name,
          avatar_url
        )
      )
    )
  `
    )
    .eq("student_id", profile.id);
  return { data: { applications }, error };
};

// react query
export const useApplicationsStatusCard = (userId: string) => {
  const { data, error, isLoading } = useQuery({
    queryKey: ["ApplicationStatus", userId],
    queryFn: () => getApplicationsStatusCard(userId),
    enabled: !!userId,
  });
  return {
    applications: data?.data?.applications || null,
    loading: isLoading,
    error,
  };
};
