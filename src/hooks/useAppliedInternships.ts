import { useState, useEffect } from 'react';
import axiosInstance from '@/config/platform-api';

// Internship interface (replacing Supabase types)
export interface Internship {
  id: string;
  title: string;
  description: string | null;
  status: string;
  created_by: string;
  application_deadline: string;
  created_at: string;
  updated_at: string;
  [key: string]: any; // For additional fields
}

export interface AppliedInternship extends Internship {
  applied_at: string;
}

export const useAppliedInternships = () => {
  const [appliedInternships, setAppliedInternships] = useState<AppliedInternship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppliedInternships = async () => {
    try {
      setLoading(true);
      setError(null);

      // Assumption: GET /api/internships/applied or /api/applications?include=internship
      // Backend should return internships with applied_date for the authenticated user
      const { data } = await axiosInstance.get('/internships/applied');

      setAppliedInternships(
        Array.isArray(data) ? data : data.internships || []
      );
    } catch (err: any) {
      console.error('Error fetching applied internships:', err);
      setError(err.message || 'Failed to fetch applied internships');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppliedInternships();
  }, []);

  return { appliedInternships, loading, error, refetch: fetchAppliedInternships };
};
