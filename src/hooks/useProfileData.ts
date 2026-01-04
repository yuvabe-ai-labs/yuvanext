import { useState, useEffect } from "react";
import axiosInstance from "@/config/platform-api";
import { DatabaseProfile, StudentProfile } from "@/types/profile";
import { useToast } from "@/hooks/use-toast";

export const useProfileData = () => {
  const { toast } = useToast();

  const [profile, setProfile] = useState<DatabaseProfile | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      // GET /api/profile (from provided endpoints)
      // Backend should return both base profile and student profile if role is student
      const { data } = await axiosInstance.get("/profile");

      // Expected response structure:
      // { data: { profile: DatabaseProfile, studentProfile?: StudentProfile } }
      // or { profile: DatabaseProfile, studentProfile?: StudentProfile }
      const profileData = data?.data?.profile || data?.profile || data;
      const studentData = data?.data?.studentProfile || data?.studentProfile;

      if (profileData) {
        setProfile(profileData as DatabaseProfile);
      }

      if (studentData) {
        setStudentProfile(studentData as StudentProfile);
      } else if (profileData?.role === "student") {
        // If student profile doesn't exist, create it via update
        // Backend should handle this automatically or we can create it
        setStudentProfile(null); // Will be created on first update
      }
    } catch (err: any) {
      console.error("Profile fetch error:", err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to fetch profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<DatabaseProfile>) => {
    if (!profile) return;

    try {
      // PUT /api/profile (from provided endpoints)
      // Backend should handle updating base profile
      const { data } = await axiosInstance.put("/profile", {
        ...updates,
      });

      const updatedProfile = data?.data?.profile || data?.profile || data;
      if (updatedProfile) {
        setProfile(updatedProfile as DatabaseProfile);
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (err: any) {
      console.error("Profile update error:", err);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const updateStudentProfile = async (updates: Partial<StudentProfile>) => {
    if (!profile?.id) return;

    try {
      // PUT /api/profile with studentProfile in body
      // Backend should handle upserting student profile
      const { data } = await axiosInstance.put("/profile", {
        studentProfile: updates,
      });

      const updatedStudentProfile =
        data?.data?.studentProfile || data?.studentProfile;
      if (updatedStudentProfile) {
        setStudentProfile(updatedStudentProfile as StudentProfile);
      } else {
        // If backend doesn't return it, update local state optimistically
        setStudentProfile({
          ...(studentProfile || ({} as StudentProfile)),
          ...updates,
        } as StudentProfile);
      }

      toast({
        title: "Success",
        description: "Student profile updated successfully",
      });
    } catch (err: any) {
      console.error("Student profile update error:", err);
      toast({
        title: "Error",
        description: "Failed to update student profile",
        variant: "destructive",
      });
    }
  };

  // Helper function to safely parse JSON data
  const parseJsonField = (field: any, defaultValue: any = []) => {
    if (!field) return defaultValue;
    if (typeof field === "string") {
      try {
        return JSON.parse(field);
      } catch {
        return defaultValue;
      }
    }
    return Array.isArray(field) ? field : defaultValue;
  };

  // Array management helpers
  const addEducationEntry = async (education: Omit<any, "id">) => {
    const currentEducation = parseJsonField(studentProfile?.education, []);
    const newEducation = [
      ...currentEducation,
      { ...education, id: crypto.randomUUID() },
    ];
    await updateStudentProfile({ education: newEducation });
  };

  const addProjectEntry = async (project: Omit<any, "id">) => {
    const currentProjects = parseJsonField(studentProfile?.projects, []);
    const newProjects = [
      ...currentProjects,
      { ...project, id: crypto.randomUUID() },
    ];
    await updateStudentProfile({ projects: newProjects });
  };

  const addCourseEntry = async (course: Omit<any, "id">) => {
    const currentCourses = parseJsonField(
      studentProfile?.completed_courses,
      []
    );
    const newCourses = [
      ...currentCourses,
      { ...course, id: crypto.randomUUID() },
    ];
    await updateStudentProfile({ completed_courses: newCourses });
  };

  const addLanguageEntry = async (language: Omit<any, "id">) => {
    const currentLanguages = parseJsonField(studentProfile?.languages, []);
    const newLanguages = [
      ...currentLanguages,
      { ...language, id: crypto.randomUUID() },
    ];
    await updateStudentProfile({ languages: newLanguages });
  };

  const addLinkEntry = async (link: Omit<any, "id">) => {
    const currentlink = parseJsonField(studentProfile?.links, []);
    const newlink = [...currentlink, { ...link, id: crypto.randomUUID() }];
    await updateStudentProfile({ links: newlink });
  };

  const addInternshipEntry = async (internship: Omit<any, "id">) => {
    // For now, we'll store in a JSON field, but could be moved to a separate table later
    const currentInternships = parseJsonField(
      (studentProfile as any)?.internships || [],
      []
    );
    const newInternships = [
      ...currentInternships,
      { ...internship, id: crypto.randomUUID() },
    ];
    await updateStudentProfile({ internships: newInternships } as any);
  };

  const updateInterests = async (interests: string[]) => {
    await updateStudentProfile({ interests });
  };

  const updateCoverLetter = async (coverLetter: string) => {
    await updateStudentProfile({ cover_letter: coverLetter });
  };

  // Remove functions for each array type
  const removeEducationEntry = async (id: string) => {
    const currentEducation = parseJsonField(studentProfile?.education, []);
    const updatedEducation = currentEducation.filter(
      (edu: any) => edu.id !== id
    );
    await updateStudentProfile({ education: updatedEducation });
  };

  const removeProjectEntry = async (id: string) => {
    const currentProjects = parseJsonField(studentProfile?.projects, []);
    const updatedProjects = currentProjects.filter(
      (project: any) => project.id !== id
    );
    await updateStudentProfile({ projects: updatedProjects });
  };

  const removeCourseEntry = async (id: string) => {
    const currentCourses = parseJsonField(
      studentProfile?.completed_courses,
      []
    );
    const updatedCourses = currentCourses.filter(
      (course: any) => course.id !== id
    );
    await updateStudentProfile({ completed_courses: updatedCourses });
  };

  const removeLanguageEntry = async (id: string) => {
    const currentLanguages = parseJsonField(studentProfile?.languages, []);
    const updatedLanguages = currentLanguages.filter(
      (lang: any) => lang.id !== id
    );
    await updateStudentProfile({ languages: updatedLanguages });
  };

  const removeLinkEntry = async (id: string) => {
    const currentLinks = parseJsonField(studentProfile?.links, []);
    const updatedLinks = currentLinks.filter((link: any) => link.id !== id);
    await updateStudentProfile({ links: updatedLinks });
  };

  const removeInternshipEntry = async (id: string) => {
    const currentInternships = parseJsonField(
      (studentProfile as any)?.internships || [],
      []
    );
    const updatedInternships = currentInternships.filter(
      (internship: any) => internship.id !== id
    );
    await updateStudentProfile({ internships: updatedInternships } as any);
  };

  const removeInterest = async (interest: string) => {
    const currentInterests = parseJsonField(studentProfile?.interests, []);
    const updatedInterests = currentInterests.filter(
      (item: string) => item !== interest
    );
    await updateStudentProfile({ interests: updatedInterests });
  };

  const removeSkill = async (skill: string) => {
    const currentSkills = parseJsonField(studentProfile?.skills, []);
    const updatedSkills = currentSkills.filter(
      (item: string) => item !== skill
    );
    await updateStudentProfile({ skills: updatedSkills });
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  return {
    profile,
    studentProfile,
    loading,
    error,
    updateProfile,
    updateStudentProfile,
    refetch: fetchProfileData,
    // Array management helpers
    addEducationEntry,
    addProjectEntry,
    addCourseEntry,
    addLanguageEntry,
    addLinkEntry,
    addInternshipEntry,
    updateInterests,
    updateCoverLetter,
    parseJsonField,
    // Remove functions
    removeEducationEntry,
    removeProjectEntry,
    removeCourseEntry,
    removeLanguageEntry,
    removeLinkEntry,
    removeInternshipEntry,
    removeInterest,
    removeSkill,
  };
};
