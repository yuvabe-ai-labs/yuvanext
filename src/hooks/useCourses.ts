import { useState, useEffect } from 'react';
import axiosInstance from '@/config/platform-api';

// Course interface (replacing Supabase types)
export interface Course {
  id: string;
  title: string;
  description: string | null;
  provider: string | null;
  duration: string | null;
  level: string | null;
  status: string;
  image_url: string | null;
  course_url: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: any; // For additional fields
}

export const useCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        // Assumption: GET /api/courses
        const { data } = await axiosInstance.get('/courses');

        setCourses(Array.isArray(data) ? data : data.courses || []);
      } catch (err: any) {
        console.error('Error fetching courses:', err);
        setError(err.message || 'Failed to fetch courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return { courses, loading, error };
};