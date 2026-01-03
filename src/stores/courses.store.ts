import { create } from "zustand";
import type { Course } from "@/types/courses.types";

interface CourseStore {
  selectedCourse: Course | null;
  setSelectedCourse: (course: Course | null) => void;
  clearSelectedCourse: () => void;
}

export const useCourseStore = create<CourseStore>((set) => ({
  selectedCourse: null,

  setSelectedCourse: (course) => set({ selectedCourse: course }),

  clearSelectedCourse: () => set({ selectedCourse: null }),
}));
