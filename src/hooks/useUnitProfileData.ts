import { useState, useEffect } from "react";
import axiosInstance from "@/config/platform-api";
import { toast } from "sonner";

export const useUnitProfileData = () => {
  const [profile, setProfile] = useState<any>(null);
  const [unitProfile, setUnitProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Helper to safely parse JSON fields
  const parseJsonField = (field: any, defaultValue: any = []) => {
    if (!field) return defaultValue;
    if (typeof field === "string") {
      try {
        return JSON.parse(field);
      } catch {
        return defaultValue;
      }
    }
    return field;
  };

  // Fetch profile and unit profile data
  const fetchProfileData = async () => {
    try {
      setLoading(true);

      // GET /api/profile (from provided endpoints)
      // Backend should return both base profile and unit profile if role is unit
      const { data } = await axiosInstance.get("/profile");

      // Expected response structure:
      // { data: { profile: DatabaseProfile, unitProfile?: UnitProfile } }
      // or { profile: DatabaseProfile, unitProfile?: UnitProfile }
      const profileData = data?.data?.profile || data?.profile || data;
      const unitData = data?.data?.unitProfile || data?.unitProfile;

      if (profileData) {
        setProfile(profileData);
      }

      if (unitData) {
        setUnitProfile(unitData);
      }
    } catch (error: any) {
      console.error("Error fetching profile data:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  // Update base profile
  const updateProfile = async (updates: any) => {
    if (!profile) return;

    try {
      // PUT /api/profile (from provided endpoints)
      const { data } = await axiosInstance.put("/profile", updates);

      const updatedProfile = data?.data?.profile || data?.profile || data;
      if (updatedProfile) {
        setProfile(updatedProfile);
      } else {
        setProfile({ ...profile, ...updates });
      }

      toast.success("Profile updated successfully");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  // Update unit profile
  const updateUnitProfile = async (updates: any) => {
    if (!profile) return;

    try {
      // PUT /api/profile with unitProfile in body
      // Backend should handle upserting unit profile
      const { data } = await axiosInstance.put("/profile", {
        unitProfile: updates,
      });

      const updatedUnitProfile =
        data?.data?.unitProfile || data?.unitProfile;
      if (updatedUnitProfile) {
        setUnitProfile(updatedUnitProfile);
      } else {
        // If backend doesn't return it, update local state optimistically
        setUnitProfile({ ...(unitProfile || {}), ...updates });
      }

      toast.success("Unit profile updated successfully");
    } catch (error: any) {
      console.error("Error updating unit profile:", error);
      toast.error("Failed to update unit profile");
    }
  };

  // Add project entry
  const addProjectEntry = async (project: any) => {
    if (!unitProfile) return;

    const projects = parseJsonField(unitProfile.projects, []);
    const newProject = { ...project, id: Date.now().toString() };
    const updatedProjects = [...projects, newProject];

    await updateUnitProfile({ projects: updatedProjects });
  };

  // Remove project entry
  const removeProjectEntry = async (projectId: string) => {
    if (!unitProfile) return;

    const projects = parseJsonField(unitProfile.projects, []);
    const updatedProjects = projects.filter((p: any) => p.id !== projectId);

    await updateUnitProfile({ projects: updatedProjects });
  };

  // Add officer entry
  const addOfficerEntry = async (officer: any) => {
    if (!unitProfile) return;

    const officers = parseJsonField(unitProfile.officers, []);
    const newOfficer = { ...officer, id: Date.now().toString() };
    const updatedOfficers = [...officers, newOfficer];

    await updateUnitProfile({ officers: updatedOfficers });
  };

  // Remove officer entry
  const removeOfficerEntry = async (officerId: string) => {
    if (!unitProfile) return;

    const officers = parseJsonField(unitProfile.officers, []);
    const updatedOfficers = officers.filter((o: any) => o.id !== officerId);

    await updateUnitProfile({ officers: updatedOfficers });
  };

  // Add achievement entry
  const addAchievementEntry = async (achievement: any) => {
    if (!unitProfile) return;

    const achievements = parseJsonField(unitProfile.achievements, []);
    const newAchievement = { ...achievement, id: Date.now().toString() };
    const updatedAchievements = [...achievements, newAchievement];

    await updateUnitProfile({ achievements: updatedAchievements });
  };

  // Remove achievement entry
  const removeAchievementEntry = async (achievementId: string) => {
    if (!unitProfile) return;

    const achievements = parseJsonField(unitProfile.achievements, []);
    const updatedAchievements = achievements.filter(
      (a: any) => a.id !== achievementId
    );

    await updateUnitProfile({ achievements: updatedAchievements });
  };

  // Update values array
  const updateValues = async (values: string[]) => {
    await updateUnitProfile({ values });
  };

  // Remove single value
  const removeValue = async (value: string) => {
    if (!unitProfile) return;

    const values = parseJsonField(unitProfile.values, []);
    const updatedValues = values.filter((v: string) => v !== value);

    await updateUnitProfile({ values: updatedValues });
  };

  // Update social links
  const updateSocialLinks = async (links: any[]) => {
    await updateUnitProfile({ social_links: links });
  };

  // Remove social link
  const removeSocialLink = async (linkId: string) => {
    if (!unitProfile) return;

    const socialLinks = parseJsonField(unitProfile.social_links, []);
    const updatedLinks = socialLinks.filter((l: any) => l.id !== linkId);

    await updateUnitProfile({ social_links: updatedLinks });
  };

  // Update gallery images
  const updateGalleryImages = async (images: string[]) => {
    await updateUnitProfile({ gallery_images: images });
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  return {
    profile,
    unitProfile,
    loading,
    updateProfile,
    updateUnitProfile,
    addProjectEntry,
    removeProjectEntry,
    addOfficerEntry,
    removeOfficerEntry,
    addAchievementEntry,
    removeAchievementEntry,
    updateValues,
    removeValue,
    updateSocialLinks,
    removeSocialLink,
    updateGalleryImages,
    parseJsonField,
    refetch: fetchProfileData,
  };
};
