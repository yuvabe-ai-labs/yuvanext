import { useState, useEffect, useCallback } from "react";
import axiosInstance from "@/config/platform-api";

// 1. For Candidates (Dashboard View)
export const useIntern = () => {
  const [internships, setInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        setLoading(true);
        // Backend filters for 'active' automatically for candidates
        const { data } = await axiosInstance.get("/internships");
        setInternships(Array.isArray(data) ? data : data.internships || []);
      } catch (error: any) {
        console.error("Error fetching internships:", error);
        setError("Failed to fetch internships");
      } finally {
        setLoading(false);
      }
    };

    fetchInternships();
  }, []);

  return { internships, loading, error };
};

// 2. For Units (My Internships View)
export const useInternships = () => {
  const [internships, setInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  const fetchInternships = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch Profile (Optional, if you need the ID)
      const profileRes = await axiosInstance.get("/profile");
      setProfile(profileRes.data.data);

      // Fetch Internships (Backend uses session to return ONLY this unit's posts)
      const { data } = await axiosInstance.get("/internships");

      setInternships(Array.isArray(data) ? data : data.data || []);
    } catch (err: any) {
      console.error("Error fetching internships:", err);
      setError(err.message || "Failed to fetch internships");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInternships();
  }, [fetchInternships]);

  return {
    internships,
    loading,
    error,
    profile,
    refetch: fetchInternships,
  };
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createInternship } from "@/services/internships.service";
import { useToast } from "@/hooks/use-toast";
import type { CreateInternshipPayload } from "@/types/internships.types";

export const useCreateInternship = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: CreateInternshipPayload) => createInternship(payload),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Internship posted successfully!",
      });
      // Invalidate the list so the new internship appears immediately
      queryClient.invalidateQueries({ queryKey: ["internships"] });
      // Also invalidate stats if you have a dashboard query
      queryClient.invalidateQueries({ queryKey: ["unitStats"] });
    },
    onError: (error: any) => {
      console.error("Create internship failed", error);
      // Toast is handled in service or here, but service returns rejected promise so this fires
    },
  });
};

import { updateInternship } from "@/services/internships.service"; // Import update service
import type { UpdateInternshipPayload } from "@/types/internships.types";

export const useUpdateInternship = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: UpdateInternshipPayload) => updateInternship(payload),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Internship updated successfully!",
      });

      // Invalidate list to show updated data
      queryClient.invalidateQueries({ queryKey: ["internships"] });
      // If you have a detail view query, invalidate that too:
      // queryClient.invalidateQueries({ queryKey: ["internship", id] });
    },
    onError: (error: any) => {
      console.error("Update internship failed", error);
      // Toast handled by error callback in component or global handler
    },
  });
};
