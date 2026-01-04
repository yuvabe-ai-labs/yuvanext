import { useState, useEffect } from 'react';
import axiosInstance from '@/config/platform-api';
import { useSession } from '@/lib/auth-client'; // Better Auth session

export const useApplicationStatus = (internshipId: string) => {
  const [hasApplied, setHasApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, isPending } = useSession();

  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (isPending || !session || !internshipId) {
        setIsLoading(false);
        return;
      }

      try {
        // GET /api/applications?internship_id={id}
        // Backend should filter by authenticated user
        const { data } = await axiosInstance.get('/applications', {
          params: { internship_id: internshipId },
        });

        const applications = Array.isArray(data) ? data : data.applications || [];
        setHasApplied(applications.length > 0);
      } catch (error: any) {
        // If 404 or no applications, user hasn't applied
        if (error.response?.status === 404) {
          setHasApplied(false);
        } else {
          console.error('Error checking application status:', error);
          setHasApplied(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkApplicationStatus();
  }, [session, isPending, internshipId]);

  const markAsApplied = () => {
    setHasApplied(true);
  };

  return { hasApplied, isLoading, markAsApplied };
};