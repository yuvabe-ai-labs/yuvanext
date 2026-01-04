import { useState, useEffect } from 'react';
import axiosInstance from '@/config/platform-api';

// Internship interface
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

export interface SavedInternship extends Internship {
  saved_at: string;
}

export const useSavedInternships = () => {
  const [savedInternships, setSavedInternships] = useState<SavedInternship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedInternships = async () => {
    try {
      setLoading(true);
      setError(null);

      // Assumption: GET /api/internships/saved or /api/saved-internships
      // Backend should return internships with saved_at for the authenticated user
      const { data } = await axiosInstance.get('/internships/saved');

      setSavedInternships(
        Array.isArray(data) ? data : data.internships || []
      );
    } catch (err: any) {
      console.error('Error fetching saved internships:', err);
      setError(err.message || 'Failed to fetch saved internships');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedInternships();
  }, []);

  return { savedInternships, loading, error, refetch: fetchSavedInternships };
};

export const useIsSaved = (internshipId: string) => {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkSaved = async () => {
    try {
      setLoading(true);
      // Assumption: GET /api/internships/{id}/saved-status or check in saved list
      // Alternative: GET /api/saved-internships/{id}
      const { data } = await axiosInstance.get(`/internships/${internshipId}/saved-status`);
      setIsSaved(data?.isSaved || false);
    } catch (error: any) {
      // If endpoint doesn't exist, check in saved list
      if (error.response?.status === 404) {
        try {
          const { data: savedList } = await axiosInstance.get('/internships/saved');
          const savedIds = Array.isArray(savedList) 
            ? savedList.map((item: any) => item.id)
            : (savedList.internships || []).map((item: any) => item.id);
          setIsSaved(savedIds.includes(internshipId));
        } catch {
          setIsSaved(false);
        }
      } else {
        console.error('Error checking saved status:', error);
        setIsSaved(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (internshipId) {
      checkSaved();
    }
  }, [internshipId]);

  return { isSaved, isLoading: loading, refetch: checkSaved };
};
