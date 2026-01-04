import { useState, useEffect, useCallback } from "react";
import axiosInstance from "@/config/platform-api";

// Course interface
export interface Course {
  id: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  [key: string]: any;
}

interface Filters {
  difficulty: string[];
  duration: string[];
  postedDate: string;
}

const ITEMS_PER_PAGE = 9;

export const useInfiniteCourses = (filters: Filters) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const fetchCourses = useCallback(async (pageNum: number, currentFilters: Filters) => {
    try {
      setLoading(true);
      setError(null);

      // GET /api/courses with query params for filters and pagination
      const params: any = {
        page: pageNum,
        limit: ITEMS_PER_PAGE,
        status: 'active',
      };

      // Add filters to params
      if (currentFilters.difficulty.length > 0) {
        params.difficulty = currentFilters.difficulty.join(',');
      }
      if (currentFilters.postedDate) {
        params.posted_date = currentFilters.postedDate;
      }

      const { data } = await axiosInstance.get('/courses', { params });

      const fetchedCourses = Array.isArray(data) ? data : data.courses || [];
      const totalCount = data?.total || data?.count || 0;

      if (pageNum === 0) {
        setCourses(fetchedCourses);
      } else {
        setCourses((prev) => [...prev, ...fetchedCourses]);
      }

      setHasMore(
        fetchedCourses.length === ITEMS_PER_PAGE && 
        totalCount > (pageNum + 1) * ITEMS_PER_PAGE
      );
    } catch (err: any) {
      console.error("[useInfiniteCourses] Fetch error:", err);
      setError(err.message || "Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(0);
    setCourses([]);
    setHasMore(true);
    fetchCourses(0, filters);
  }, [filters, fetchCourses]);

  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchCourses(nextPage, filters);
  }, [page, filters, fetchCourses]);

  return { courses, loading, error, hasMore, loadMore };
};
