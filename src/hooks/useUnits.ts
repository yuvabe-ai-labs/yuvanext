import { useState, useEffect } from 'react';
import axiosInstance from '@/config/platform-api';

// Unit interface (replacing Supabase types)
export interface Unit {
  id: string;
  profile_id: string;
  unit_name: string;
  unit_type: string | null;
  location: string | null;
  email: string | null;
  phone: string | null;
  focus_areas: string[] | string | null;
  skills: string[] | string | null;
  is_aurovillian: boolean | null;
  opportunities: string[] | string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: any; // For additional fields
}

export const useUnits = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        setLoading(true);
        setError(null);

        // Assumption: GET /api/units
        const { data } = await axiosInstance.get('/units');

        setUnits(Array.isArray(data) ? data : data.units || []);
      } catch (err: any) {
        console.error('Error fetching units:', err);
        setError(err.message || 'Failed to fetch units');
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, []);

  return { units, loading, error };
};