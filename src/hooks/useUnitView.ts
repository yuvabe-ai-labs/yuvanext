import { useState, useEffect } from 'react';
import axiosInstance from '@/config/platform-api';

// Interfaces (replacing Supabase types)
export interface Unit {
  id: string;
  profile_id: string;
  unit_name: string;
  unit_type: string | null;
  location: string | null;
  [key: string]: any;
}

export interface Internship {
  id: string;
  title: string;
  description: string | null;
  status: string;
  created_by: string;
  [key: string]: any;
}

export const useUnitView = (unitId: string) => {
  const [unit, setUnit] = useState<Unit | null>(null);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUnitData = async () => {
      if (!unitId) return;

      try {
        setLoading(true);
        setError(null);

        // Assumption: GET /api/units/{id}
        // Backend should return unit with nested internships or separate call
        const { data } = await axiosInstance.get(`/units/${unitId}`);

        // Expected response structure:
        // { unit, internships } or { data: { unit, internships } }
        const unitData = data?.data?.unit || data?.unit || data;
        const internshipsData = data?.data?.internships || data?.internships || [];

        if (!unitData) {
          setError('Unit not found');
          return;
        }

        setUnit(unitData);
        setInternships(Array.isArray(internshipsData) ? internshipsData : []);
      } catch (err: any) {
        console.error('Error fetching unit data:', err);
        setError(err.message || 'Failed to fetch unit data');
      } finally {
        setLoading(false);
      }
    };

    fetchUnitData();
  }, [unitId]);

  return { unit, internships, loading, error };
};
