import { useState, useEffect } from 'react';
import axiosInstance from '@/config/platform-api';

// Application interface (replacing Supabase types)
export interface Application {
  id: string;
  internship_id: string;
  student_id: string;
  status: string;
  applied_date: string;
  profile_match_score: number | null;
  offer_decision: string | null;
  created_at: string;
  updated_at: string;
}

export const useApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError(null);

        // Assumption: GET /api/applications (for candidate view)
        // Backend should filter by authenticated user's profile
        const { data } = await axiosInstance.get('/applications');

        setApplications(
          Array.isArray(data) ? data : data.applications || []
        );
      } catch (err: any) {
        console.error('Error fetching applications:', err);
        setError(err.message || 'Failed to fetch applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  return { applications, loading, error };
};