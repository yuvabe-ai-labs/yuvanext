import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '@/config/platform-api';

// Internship interface
export interface Internship {
  id: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  [key: string]: any;
}

interface InternshipFilters {
  units: string[];
  industries: string[];
  departments: string[];
  coursePeriod: { min: number; max: number };
  postingDate: { from?: string; to?: string };
  interestAreas: string[];
}

const PAGE_SIZE = 9; // 3 columns x 3 rows

export const useInfiniteInternships = (filters: InternshipFilters) => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const fetchInternships = useCallback(async (pageNum: number) => {
    try {
      setLoading(pageNum === 0);
      setError(null);

      // GET /api/internships with query params for filters and pagination
      const params: any = {
        page: pageNum,
        limit: PAGE_SIZE,
        status: 'active',
      };

      // Add filters to params
      if (filters.units.length > 0) {
        params.units = filters.units.join(',');
      }
      if (filters.industries.length > 0) {
        params.industries = filters.industries.join(',');
      }
      if (filters.postingDate.from) {
        params.posted_from = filters.postingDate.from;
      }
      if (filters.postingDate.to) {
        params.posted_to = filters.postingDate.to;
      }

      const { data } = await axiosInstance.get('/internships', { params });

      const fetchedInternships = Array.isArray(data) ? data : data.internships || [];

      if (pageNum === 0) {
        setInternships(fetchedInternships);
      } else {
        setInternships((prev) => [...prev, ...fetchedInternships]);
      }

      setHasMore(fetchedInternships.length === PAGE_SIZE);
    } catch (err: any) {
      console.error('[useInfiniteInternships] Error:', err);
      setError(err.message || 'Failed to fetch internships');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Reset when filters change
  useEffect(() => {
    setPage(0);
    setInternships([]);
    setHasMore(true);
    fetchInternships(0);
  }, [
    filters.units.join(','),
    filters.industries.join(','),
    filters.departments.join(','),
    filters.coursePeriod.min,
    filters.coursePeriod.max,
    filters.postingDate.from,
    filters.postingDate.to,
    filters.interestAreas.join(','),
    fetchInternships,
  ]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchInternships(nextPage);
    }
  }, [loading, hasMore, page, fetchInternships]);

  return {
    internships,
    loading,
    error,
    hasMore,
    loadMore,
  };
};
