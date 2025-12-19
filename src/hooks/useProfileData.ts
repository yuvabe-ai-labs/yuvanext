import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DatabaseProfile, StudentProfile } from "@/types/profile";
import { useToast } from "@/hooks/use-toast";

export const useProfileData = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<DatabaseProfile | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfileData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("Fetching profile for user ID:", user.id);

      // 1. Fetch basic profile by user_id
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      console.log("Profile data fetched:", profileData);
      setProfile(profileData as DatabaseProfile);

      // 2. Fetch or create student profile
      let studentData: StudentProfile | null = null;

      if (profileData?.id) {
        const { data, error: studentError } = await supabase
          .from("student_profiles")
          .select("*")
          .eq("profile_id", profileData.id)
          .maybeSingle();

        if (studentError && studentError.code !== "PGRST116") {
          throw studentError;
        }

        studentData = data as unknown as StudentProfile | null;

        // Auto-create if missing and role = student
        if (!studentData && profileData?.role === "student") {
          console.log("No student profile found, creating one...");
          const { data: newStudent, error: insertError } = await supabase
            .from("student_profiles")
            .insert({
              profile_id: profileData.id,
            })
            .select()
            .single();

          if (insertError) throw insertError;
          studentData = newStudent as unknown as StudentProfile;
        }
      }

      setStudentProfile(studentData);
      console.log("Student profile data fetched:", studentData);
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
    if (!user || !profile) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data as DatabaseProfile);

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
      const { data, error } = await supabase
        .from("student_profiles")
        .upsert(
          {
            profile_id: profile.id,
            ...updates,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "profile_id" }
        )
        .select()
        .single();

      if (error) throw error;

      setStudentProfile(data as unknown as StudentProfile);

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
  }, [user?.id]);

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
