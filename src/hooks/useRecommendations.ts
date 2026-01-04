import { useMemo } from "react";

// Interfaces (replacing Supabase types)
interface Internship {
  id: string;
  title: string;
  skills_required: string | string[] | null;
  [key: string]: any;
}

interface Course {
  id: string;
  title: string;
  category: string | null;
  [key: string]: any;
}

interface InternshipWithScore extends Internship {
  job_type: any;
  matchScore: number;
  matchPercentage: number;
  unit_avatar?: string | null;
  unit_name?: string | null;
}

interface CourseWithScore extends Course {
  matchScore: number;
}

export const useInternshipRecommendations = (
  internships: any[],
  userSkills: string[]
): InternshipWithScore[] => {
  return useMemo(() => {
    if (!internships || internships.length === 0) return [];

    // Case: no user skills → return first 10 internships (e.g. recent)
    if (!userSkills || userSkills.length === 0) {
      return internships.slice(0, 10).map((i) => ({
        ...i,
        matchScore: 0,
        matchPercentage: 0,
      }));
    }

    // Normalize and deduplicate user skills
    const normalizedUserSkills = Array.from(
      new Set(userSkills.map((s) => s.toLowerCase().trim()))
    );

    const scored = internships.map((internship) => {
      let skillsRequired: any[] = [];

      try {
        if (typeof internship.skills_required === "string") {
          skillsRequired = JSON.parse(internship.skills_required);
        } else if (
          internship.skills_required &&
          typeof internship.skills_required === "object"
        ) {
          skillsRequired = Array.isArray(internship.skills_required)
            ? internship.skills_required
            : [];
        }
      } catch {
        skillsRequired = [];
      }

      const normalizedRequired = skillsRequired
        .filter((s): s is string => typeof s === "string")
        .map((s) => s.toLowerCase().trim());

      const matchCount = normalizedUserSkills.filter((userSkill) =>
        normalizedRequired.some(
          (req) => req.includes(userSkill) || userSkill.includes(req)
        )
      ).length;

      const matchPercentage =
        normalizedRequired.length > 0
          ? (matchCount / normalizedRequired.length) * 100
          : 0;

      return {
        ...internship,
        matchScore: matchCount,
        matchPercentage,
      };
    });

    // Sort by best matches first
    const sorted = scored.sort((a, b) => {
      if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
      return b.matchPercentage - a.matchPercentage;
    });

    // Filter only matching internships
    const filtered = sorted.filter((i) => i.matchScore > 0);

    // Return all matches; if none, fallback to 6 general internships
    return filtered.length > 0 ? filtered : sorted.slice(0, 6);
  }, [internships, userSkills]);
};

export const useCourseRecommendations = (
  courses: Course[],
  userSkills: string[]
): CourseWithScore[] => {
  return useMemo(() => {
    if (!courses || courses.length === 0) return [];

    // Case: no skills → return first 6 courses (recent/default)
    if (!userSkills || userSkills.length === 0) {
      return courses.slice(0, 6).map((c) => ({
        ...c,
        matchScore: 0,
      }));
    }

    const normalizedUserSkills = Array.from(
      new Set(userSkills.map((s) => s.toLowerCase().trim()))
    );

    const scored = courses.map((course) => {
      const category = course.category?.toLowerCase() || "";
      const title = course.title?.toLowerCase() || "";

      // Partial match: skill appears in title or category
      const matchCount = normalizedUserSkills.filter(
        (userSkill) => category.includes(userSkill) || title.includes(userSkill)
      ).length;

      return {
        ...course,
        matchScore: matchCount,
      };
    });

    const sorted = scored.sort((a, b) => b.matchScore - a.matchScore);
    const filtered = sorted.filter((c) => c.matchScore > 0);

    // Return all matches; if none, fallback to 6 general courses
    return filtered.length > 0 ? filtered : sorted.slice(0, 6);
  }, [courses, userSkills]);
};
